"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import styles from "./admin.module.css";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [activeTab, setActiveTab] = useState("list"); // 'list', 'editor', 'settings'
  const [apps, setApps] = useState([]);
  const [appAds, setAppAds] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Editor State
  const [currentApp, setCurrentApp] = useState(null);

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

  // Upload Logic
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

  // Editor Logic
  const openEditor = (app) => {
    if (app) {
      setCurrentApp(app);
    } else {
      setCurrentApp({
        id: "",
        name: "",
        description: "",
        icon: "",
        playStoreLink: "",
        privacyPolicy: "# Privacy Policy",
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
        playStoreLink: currentApp.playStoreLink,
        privacyPolicy: currentApp.privacyPolicy,
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
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Dashboard</h2>
        </div>
        <div className={styles.navMenu}>
          <div className={`${styles.navItem} ${activeTab === 'list' || activeTab === 'editor' ? styles.active : ''}`} onClick={() => setActiveTab('list')}>
            📦 Daftar Aplikasi
          </div>
          <div className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>
            ⚙️ Pengaturan Web
          </div>
        </div>
        <div className={styles.sidebarFooter}>
          <button className={styles.btnSecondary} onClick={handleLogout} style={{width: '100%'}}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Tab: Daftar Aplikasi */}
        {activeTab === 'list' && (
          <>
            <div className={styles.pageHeader}>
              <h1>Daftar Aplikasi</h1>
              <button className={styles.btn} onClick={() => openEditor(null)}>+ Tambah Baru</button>
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
                          <button className={`${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => openEditor(app)} style={{marginRight: '8px'}}>Edit</button>
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
                <input className={styles.input} value={currentApp.playStoreLink} onChange={(e) => setCurrentApp({...currentApp, playStoreLink: e.target.value})} />
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
                <label>Privacy Policy (Markdown)</label>
                <textarea className={`${styles.textarea} ${styles.textareaCode}`} value={currentApp.privacyPolicy} onChange={(e) => setCurrentApp({...currentApp, privacyPolicy: e.target.value})} />
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
