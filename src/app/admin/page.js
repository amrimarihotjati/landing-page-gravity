"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import styles from "./admin.module.css";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [activeTab, setActiveTab] = useState("list"); // 'list', 'editor', 'settings', 'pages', 'page_editor'
  const [apps, setApps] = useState([]);
  const [pages, setPages] = useState([]);
  const [appAds, setAppAds] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Editor State
  const [currentApp, setCurrentApp] = useState(null);
  const [currentPageData, setCurrentPageData] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    const { data: appsData } = await supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: true });
    if (appsData) setApps(appsData);

    const { data: pagesData } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: true });
    if (pagesData) setPages(pagesData);

    const { data: settingsData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'app-ads')
      .single();
    if (settingsData) setAppAds(settingsData.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage({ text: error.message, type: "error" });
    else setMessage({ text: "", type: "" });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileUpload = async (e, type) => {
    try {
      setUploading(true);
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const uploadedUrls = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }

      if (type === 'icon') {
        setCurrentApp({ ...currentApp, icon: uploadedUrls[0] });
      } else if (type === 'screenshots') {
        const existing = currentApp.screenshots || [];
        setCurrentApp({ ...currentApp, screenshots: [...existing, ...uploadedUrls] });
      }
      
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = (indexToRemove) => {
    const updatedSS = currentApp.screenshots.filter((_, idx) => idx !== indexToRemove);
    setCurrentApp({ ...currentApp, screenshots: updatedSS });
  };

  // --- App Editor Logic ---
  const openAppEditor = (app) => {
    if (app) {
      setCurrentApp(app);
    } else {
      setCurrentApp({
        id: "",
        name: "",
        description: "",
        icon: "",
        playstorelink: "",
        customprivacylink: "",
        screenshots: [],
        isNew: true
      });
    }
    setActiveTab("editor");
    setMessage({ text: "", type: "" });
  };

  const handleSaveApp = async () => {
    if (!currentApp.id || !currentApp.name) {
      setMessage({ text: "ID dan Nama Aplikasi wajib diisi", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const appData = {
        id: currentApp.id,
        name: currentApp.name,
        description: currentApp.description,
        icon: currentApp.icon,
        playstorelink: currentApp.playstorelink,
        customprivacylink: currentApp.customprivacylink,
        screenshots: currentApp.screenshots || []
      };

      if (currentApp.isNew) {
        const { error } = await supabase.from('apps').insert([appData]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('apps').update(appData).eq('id', currentApp.id);
        if (error) throw error;
      }
      
      setMessage({ text: "Aplikasi berhasil disimpan!", type: "success" });
      await fetchData();
      setTimeout(() => setActiveTab("list"), 1500);
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    }
    setLoading(false);
  };

  const handleDeleteApp = async (id) => {
    if (!confirm("Yakin ingin menghapus aplikasi ini?")) return;
    setLoading(true);
    await supabase.from('apps').delete().eq('id', id);
    await fetchData();
    setLoading(false);
  };

  // --- Page Editor Logic ---
  const openPageEditor = (page) => {
    if (page) {
      setCurrentPageData(page);
    } else {
      setCurrentPageData({
        slug: "",
        title: "",
        content: "# Tulis isi artikel/halaman Anda di sini",
        isNew: true
      });
    }
    setActiveTab("page_editor");
    setMessage({ text: "", type: "" });
  };

  const handleSavePage = async () => {
    if (!currentPageData.slug || !currentPageData.title) {
      setMessage({ text: "Slug dan Judul wajib diisi", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        slug: currentPageData.slug,
        title: currentPageData.title,
        content: currentPageData.content
      };

      if (currentPageData.isNew) {
        const { error } = await supabase.from('pages').insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pages').update(payload).eq('slug', currentPageData.slug);
        if (error) throw error;
      }
      
      setMessage({ text: "Halaman berhasil disimpan!", type: "success" });
      await fetchData();
      setTimeout(() => setActiveTab("pages"), 1500);
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    }
    setLoading(false);
  };

  const handleDeletePage = async (slug) => {
    if (!confirm("Yakin ingin menghapus halaman ini?")) return;
    setLoading(true);
    await supabase.from('pages').delete().eq('slug', slug);
    await fetchData();
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    const { error } = await supabase.from('settings').upsert([{ key: 'app-ads', value: appAds }]);
    if (error) setMessage({ text: error.message, type: "error" });
    else setMessage({ text: "Pengaturan berhasil disimpan!", type: "success" });
    setLoading(false);
  };

  if (!session) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h2>Login CMS</h2>
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <input type="email" placeholder="Email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <input type="password" placeholder="Password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {message.text && <p style={{color: 'red', marginBottom: '1rem', fontSize: '0.9rem'}}>{message.text}</p>}
            <button type="submit" className={`${styles.btn} ${styles.btnFull}`} disabled={loading} style={{width: '100%'}}>
              {loading ? 'Loading...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cmsContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Dashboard</h2>
        </div>
        <div className={styles.navMenu}>
          <div className={`${styles.navItem} ${activeTab === 'list' || activeTab === 'editor' ? styles.active : ''}`} onClick={() => setActiveTab('list')}>
            📦 Daftar Aplikasi
          </div>
          <div className={`${styles.navItem} ${activeTab === 'pages' || activeTab === 'page_editor' ? styles.active : ''}`} onClick={() => setActiveTab('pages')}>
            📄 Halaman (Artikel)
          </div>
          <div className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>
            ⚙️ Pengaturan Web
          </div>
        </div>
        <div className={styles.sidebarFooter}>
          <button className={styles.btnSecondary} onClick={handleLogout} style={{width: '100%'}}>Logout</button>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Tab: Daftar Aplikasi */}
        {activeTab === 'list' && (
          <>
            <div className={styles.pageHeader}>
              <h1>Daftar Aplikasi</h1>
              <button className={styles.btn} onClick={() => openAppEditor(null)}>+ Tambah Aplikasi</button>
            </div>
            <div className={styles.card}>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nama Aplikasi</th>
                      <th>Slug (ID)</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.length === 0 ? (
                      <tr><td colSpan="3" style={{textAlign: 'center', padding: '2rem'}}>Belum ada aplikasi.</td></tr>
                    ) : apps.map(app => (
                      <tr key={app.id}>
                        <td><strong>{app.name}</strong></td>
                        <td>{app.id}</td>
                        <td>
                          <button className={`${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => openAppEditor(app)} style={{marginRight: '8px'}}>Edit</button>
                          <button className={`${styles.btnDanger} ${styles.btnSmall}`} onClick={() => handleDeleteApp(app.id)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Tab: Editor Aplikasi */}
        {activeTab === 'editor' && currentApp && (
          <>
            <div className={styles.pageHeader}>
              <h1>{currentApp.isNew ? 'Tambah Aplikasi Baru' : 'Edit Aplikasi'}</h1>
              <button className={styles.btnSecondary} onClick={() => setActiveTab('list')}>KEMBALI</button>
            </div>
            <div className={styles.card}>
              <div className={styles.formGroup}>
                <label>ID / Slug URL (Harus Unik, tanpa spasi)</label>
                <input className={styles.input} value={currentApp.id} onChange={(e) => setCurrentApp({...currentApp, id: e.target.value})} disabled={!currentApp.isNew} placeholder="misal: harga-emas" />
              </div>
              <div className={styles.formGroup}>
                <label>Nama Aplikasi</label>
                <input className={styles.input} value={currentApp.name} onChange={(e) => setCurrentApp({...currentApp, name: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Deskripsi Singkat</label>
                <textarea className={styles.textarea} value={currentApp.description} onChange={(e) => setCurrentApp({...currentApp, description: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Play Store Link</label>
                <input className={styles.input} value={currentApp.playstorelink} onChange={(e) => setCurrentApp({...currentApp, playstorelink: e.target.value})} />
              </div>
              
              <div className={styles.formGroup}>
                <label>Ikon Aplikasi (Bisa ketik Emoji, link URL, atau Upload)</label>
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                  <input className={styles.input} value={currentApp.icon} onChange={(e) => setCurrentApp({...currentApp, icon: e.target.value})} style={{flex: 1}} />
                  <label className={styles.btnSecondary} style={{cursor: 'pointer', margin: 0}}>
                    {uploading ? 'Uploading...' : 'Upload Icon'}
                    <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, 'icon')} disabled={uploading} />
                  </label>
                </div>
                {currentApp.icon && currentApp.icon.startsWith('http') && (
                  <img src={currentApp.icon} alt="Icon Preview" className={styles.imagePreview} style={{marginTop: '10px', width: '60px', height: '60px', borderRadius: '12px'}} />
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Screenshots (Galeri)</label>
                <div className={styles.uploadBox}>
                  <label style={{cursor: 'pointer', display: 'block'}}>
                    {uploading ? 'Sedang Mengunggah...' : 'Klik di sini untuk upload banyak gambar (Screenshots)'}
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFileUpload(e, 'screenshots')} disabled={uploading} />
                  </label>
                </div>
                {currentApp.screenshots && currentApp.screenshots.length > 0 && (
                  <div className={styles.gallery}>
                    {currentApp.screenshots.map((url, idx) => (
                      <div key={idx} className={styles.imagePreviewWrapper}>
                        <img src={url} alt={`Screenshot ${idx}`} className={styles.imagePreview} />
                        <button className={styles.deleteImageBtn} onClick={() => removeScreenshot(idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Tautan Privacy Policy</label>
                <div style={{fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px'}}>
                  Ketik URL eksternal (https://...) ATAU ketik path lokal dari Halaman CMS Anda (misal: <strong>/page/kebijakan-privasi</strong>).
                </div>
                <input className={styles.input} placeholder="/page/slug-halaman atau https://..." value={currentApp.customprivacylink || ''} onChange={(e) => setCurrentApp({...currentApp, customprivacylink: e.target.value})} />
              </div>

              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
              )}
              
              <button className={styles.btn} onClick={handleSaveApp} disabled={loading || uploading}>
                {loading ? "Menyimpan..." : "Simpan Aplikasi"}
              </button>
            </div>
          </>
        )}

        {/* Tab: Daftar Halaman */}
        {activeTab === 'pages' && (
          <>
            <div className={styles.pageHeader}>
              <h1>Daftar Halaman (Privacy & Artikel)</h1>
              <button className={styles.btn} onClick={() => openPageEditor(null)}>+ Buat Halaman Baru</button>
            </div>
            <div className={styles.card}>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Judul Halaman</th>
                      <th>URL Path</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.length === 0 ? (
                      <tr><td colSpan="3" style={{textAlign: 'center', padding: '2rem'}}>Belum ada halaman.</td></tr>
                    ) : pages.map(page => (
                      <tr key={page.slug}>
                        <td><strong>{page.title}</strong></td>
                        <td>/page/{page.slug}</td>
                        <td>
                          <button className={`${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => openPageEditor(page)} style={{marginRight: '8px'}}>Edit</button>
                          <button className={`${styles.btnDanger} ${styles.btnSmall}`} onClick={() => handleDeletePage(page.slug)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Tab: Editor Halaman */}
        {activeTab === 'page_editor' && currentPageData && (
          <>
            <div className={styles.pageHeader}>
              <h1>{currentPageData.isNew ? 'Buat Halaman Baru' : 'Edit Halaman'}</h1>
              <button className={styles.btnSecondary} onClick={() => setActiveTab('pages')}>KEMBALI</button>
            </div>
            <div className={styles.card}>
              <div className={styles.formGroup}>
                <label>Slug URL (Harus Unik, tanpa spasi)</label>
                <input className={styles.input} value={currentPageData.slug} onChange={(e) => setCurrentPageData({...currentPageData, slug: e.target.value})} disabled={!currentPageData.isNew} placeholder="misal: kebijakan-privasi-1" />
              </div>
              <div className={styles.formGroup}>
                <label>Judul Halaman</label>
                <input className={styles.input} value={currentPageData.title} onChange={(e) => setCurrentPageData({...currentPageData, title: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Konten (Markdown)</label>
                <textarea className={`${styles.textarea} ${styles.textareaCode}`} value={currentPageData.content} onChange={(e) => setCurrentPageData({...currentPageData, content: e.target.value})} />
              </div>

              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
              )}
              
              <button className={styles.btn} onClick={handleSavePage} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Halaman"}
              </button>
            </div>
          </>
        )}

        {/* Tab: Pengaturan */}
        {activeTab === 'settings' && (
          <>
            <div className={styles.pageHeader}>
              <h1>Pengaturan Website</h1>
            </div>
            <div className={styles.card}>
              <div className={styles.formGroup}>
                <label>Edit isi app-ads.txt</label>
                <textarea className={`${styles.textarea} ${styles.textareaCode}`} value={appAds} onChange={(e) => setAppAds(e.target.value)} />
              </div>
              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
              )}
              <button className={styles.btn} onClick={handleSaveSettings} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
