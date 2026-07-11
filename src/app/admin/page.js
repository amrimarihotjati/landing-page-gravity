"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import s from "./admin.module.css";

export default function AdminPage() {
  /* ── Auth State ── */
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ── Data State ── */
  const [activeTab, setActiveTab] = useState("list");
  const [apps, setApps] = useState([]);
  const [pages, setPages] = useState([]);
  const [appAds, setAppAds] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  /* ── Editor State ── */
  const [currentApp, setCurrentApp] = useState(null);
  const [currentPageData, setCurrentPageData] = useState(null);

  /* ================================================================
     Auth
     ================================================================ */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) fetchData();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setMessage({ text: error.message, type: "error" });
    else setMessage({ text: "", type: "" });
    setLoading(false);
  };

  const handleLogout = () => supabase.auth.signOut();

  /* ================================================================
     Data Fetching
     ================================================================ */
  const fetchData = async () => {
    const [appsRes, pagesRes, settingsRes] = await Promise.all([
      supabase.from("apps").select("*").order("created_at", { ascending: true }),
      supabase.from("pages").select("*").order("created_at", { ascending: true }),
      supabase.from("settings").select("value").eq("key", "app-ads").single(),
    ]);

    if (appsRes.data) setApps(appsRes.data);
    if (pagesRes.data) setPages(pagesRes.data);
    if (settingsRes.data) setAppAds(settingsRes.data.value);
  };

  /* ================================================================
     File Upload
     ================================================================ */
  const handleFileUpload = async (e, type) => {
    try {
      setUploading(true);
      const files = e.target.files;
      if (!files?.length) return;

      const uploadedUrls = [];

      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${Math.random()}.${ext}`;

        const { error } = await supabase.storage
          .from("assets")
          .upload(path, file);
        if (error) throw error;

        const { data } = supabase.storage.from("assets").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      if (type === "icon") {
        setCurrentApp((prev) => ({ ...prev, icon: uploadedUrls[0] }));
      } else if (type === "screenshots") {
        setCurrentApp((prev) => ({
          ...prev,
          screenshots: [...(prev.screenshots || []), ...uploadedUrls],
        }));
      }
    } catch (err) {
      alert("Error uploading: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = (index) => {
    setCurrentApp((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }));
  };

  /* ================================================================
     App CRUD
     ================================================================ */
  const openAppEditor = (app) => {
    setCurrentApp(
      app || {
        id: "",
        name: "",
        description: "",
        icon: "",
        playstorelink: "",
        customprivacylink: "",
        screenshots: [],
        isNew: true,
      }
    );
    setActiveTab("editor");
    setMessage({ text: "", type: "" });
  };

  const handleSaveApp = async () => {
    if (!currentApp.id || !currentApp.name) {
      setMessage({ text: "ID dan Nama Aplikasi wajib diisi.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        id: currentApp.id,
        name: currentApp.name,
        description: currentApp.description,
        icon: currentApp.icon,
        playstorelink: currentApp.playstorelink,
        customprivacylink: currentApp.customprivacylink,
        screenshots: currentApp.screenshots || [],
      };

      const { error } = currentApp.isNew
        ? await supabase.from("apps").insert([payload])
        : await supabase.from("apps").update(payload).eq("id", currentApp.id);

      if (error) throw error;

      setMessage({ text: "Aplikasi berhasil disimpan!", type: "success" });
      await fetchData();
      setTimeout(() => setActiveTab("list"), 1200);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
    setLoading(false);
  };

  const handleDeleteApp = async (id) => {
    if (!confirm("Yakin ingin menghapus aplikasi ini?")) return;
    setLoading(true);
    await supabase.from("apps").delete().eq("id", id);
    await fetchData();
    setLoading(false);
  };

  /* ================================================================
     Page CRUD
     ================================================================ */
  const openPageEditor = (page) => {
    setCurrentPageData(
      page || {
        slug: "",
        title: "",
        content: "# Judul\n\nTulis isi halaman di sini.",
        isNew: true,
      }
    );
    setActiveTab("page_editor");
    setMessage({ text: "", type: "" });
  };

  const handleSavePage = async () => {
    if (!currentPageData.slug || !currentPageData.title) {
      setMessage({ text: "Slug dan Judul wajib diisi.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        slug: currentPageData.slug,
        title: currentPageData.title,
        content: currentPageData.content,
      };

      const { error } = currentPageData.isNew
        ? await supabase.from("pages").insert([payload])
        : await supabase
            .from("pages")
            .update(payload)
            .eq("slug", currentPageData.slug);

      if (error) throw error;

      setMessage({ text: "Halaman berhasil disimpan!", type: "success" });
      await fetchData();
      setTimeout(() => setActiveTab("pages"), 1200);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
    setLoading(false);
  };

  const handleDeletePage = async (slug) => {
    if (!confirm("Yakin ingin menghapus halaman ini?")) return;
    setLoading(true);
    await supabase.from("pages").delete().eq("slug", slug);
    await fetchData();
    setLoading(false);
  };

  /* ================================================================
     Settings
     ================================================================ */
  const handleSaveSettings = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("settings")
      .upsert([{ key: "app-ads", value: appAds }]);
    setMessage(
      error
        ? { text: error.message, type: "error" }
        : { text: "Pengaturan berhasil disimpan!", type: "success" }
    );
    setLoading(false);
  };

  /* ================================================================
     Shared UI Helpers
     ================================================================ */
  const MessageBanner = () =>
    message.text ? (
      <div className={`${s.message} ${s[message.type]}`}>{message.text}</div>
    ) : null;

  /* ================================================================
     RENDER — Login
     ================================================================ */
  if (!session) {
    return (
      <div className={s.loginContainer}>
        <div className={s.loginCard}>
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className={s.formGroup}>
              <input
                type="email"
                placeholder="Email"
                className={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={s.formGroup}>
              <input
                type="password"
                placeholder="Password"
                className={s.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {message.text && <p className={s.loginError}>{message.text}</p>}
            <button
              type="submit"
              className={`${s.btn} ${s.btnFull}`}
              disabled={loading}
            >
              {loading ? "Loading..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ================================================================
     RENDER — Dashboard
     ================================================================ */
  return (
    <div className={s.cmsContainer}>
      {/* ── Sidebar ── */}
      <aside className={s.sidebar}>
        <div className={s.sidebarHeader}>
          <h2>Admin CMS</h2>
        </div>
        <nav className={s.navMenu}>
          <div
            className={`${s.navItem} ${activeTab === "list" || activeTab === "editor" ? s.active : ""}`}
            onClick={() => setActiveTab("list")}
          >
            📦 Aplikasi
          </div>
          <div
            className={`${s.navItem} ${activeTab === "pages" || activeTab === "page_editor" ? s.active : ""}`}
            onClick={() => setActiveTab("pages")}
          >
            📄 Halaman
          </div>
          <div
            className={`${s.navItem} ${activeTab === "settings" ? s.active : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Pengaturan
          </div>
        </nav>
        <div className={s.sidebarFooter}>
          <button className={`${s.btnSecondary} ${s.btnFull}`} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={s.mainContent}>
        {/* ---------- App List ---------- */}
        {activeTab === "list" && (
          <>
            <div className={s.pageHeader}>
              <h1>Daftar Aplikasi</h1>
              <button className={s.btn} onClick={() => openAppEditor(null)}>
                + Tambah
              </button>
            </div>
            <div className={s.card}>
              <div className={s.tableContainer}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Slug</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.length === 0 ? (
                      <tr>
                        <td colSpan="3" className={s.emptyRow}>
                          Belum ada aplikasi.
                        </td>
                      </tr>
                    ) : (
                      apps.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <strong>{app.name}</strong>
                          </td>
                          <td>{app.id}</td>
                          <td>
                            <button
                              className={`${s.btnSecondary} ${s.btnSmall}`}
                              onClick={() => openAppEditor(app)}
                            >
                              Edit
                            </button>{" "}
                            <button
                              className={`${s.btnDanger} ${s.btnSmall}`}
                              onClick={() => handleDeleteApp(app.id)}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ---------- App Editor ---------- */}
        {activeTab === "editor" && currentApp && (
          <>
            <p className={s.breadcrumb}>Aplikasi / {currentApp.isNew ? "Baru" : currentApp.name}</p>
            <div className={s.pageHeader}>
              <h1>{currentApp.isNew ? "Tambah Aplikasi" : "Edit Aplikasi"}</h1>
              <button className={s.btnSecondary} onClick={() => setActiveTab("list")}>
                ← Kembali
              </button>
            </div>
            <div className={s.card}>
              {/* ID */}
              <div className={s.formGroup}>
                <label className={s.label}>ID / Slug URL</label>
                <input
                  className={s.input}
                  value={currentApp.id}
                  onChange={(e) =>
                    setCurrentApp({ ...currentApp, id: e.target.value })
                  }
                  disabled={!currentApp.isNew}
                  placeholder="contoh: harga-emas"
                />
              </div>

              {/* Name */}
              <div className={s.formGroup}>
                <label className={s.label}>Nama Aplikasi</label>
                <input
                  className={s.input}
                  value={currentApp.name}
                  onChange={(e) =>
                    setCurrentApp({ ...currentApp, name: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div className={s.formGroup}>
                <label className={s.label}>Deskripsi</label>
                <textarea
                  className={s.textarea}
                  value={currentApp.description}
                  onChange={(e) =>
                    setCurrentApp({ ...currentApp, description: e.target.value })
                  }
                />
              </div>

              {/* Play Store */}
              <div className={s.formGroup}>
                <label className={s.label}>Link Play Store</label>
                <input
                  className={s.input}
                  value={currentApp.playstorelink}
                  onChange={(e) =>
                    setCurrentApp({
                      ...currentApp,
                      playstorelink: e.target.value,
                    })
                  }
                  placeholder="https://play.google.com/store/apps/details?id=..."
                />
              </div>

              {/* Icon */}
              <div className={s.formGroup}>
                <label className={s.label}>Ikon Aplikasi</label>
                <div className={s.iconRow}>
                  <input
                    className={`${s.input} ${s.iconRowInput}`}
                    value={currentApp.icon}
                    onChange={(e) =>
                      setCurrentApp({ ...currentApp, icon: e.target.value })
                    }
                    placeholder="Emoji, URL, atau upload"
                  />
                  <label className={s.btnUpload}>
                    {uploading ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleFileUpload(e, "icon")}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {currentApp.icon?.startsWith("http") && (
                  <img
                    src={currentApp.icon}
                    alt="Icon"
                    className={s.iconPreview}
                  />
                )}
              </div>

              {/* Screenshots */}
              <div className={s.formGroup}>
                <label className={s.label}>Screenshots</label>
                <label className={s.uploadBox}>
                  {uploading
                    ? "Sedang mengunggah..."
                    : "Klik untuk upload gambar (bisa pilih banyak)"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => handleFileUpload(e, "screenshots")}
                    disabled={uploading}
                  />
                </label>
                {currentApp.screenshots?.length > 0 && (
                  <div className={s.gallery}>
                    {currentApp.screenshots.map((url, i) => (
                      <div key={i} className={s.imagePreviewWrapper}>
                        <img
                          src={url}
                          alt={`SS ${i}`}
                          className={s.imagePreview}
                        />
                        <button
                          className={s.deleteImageBtn}
                          onClick={() => removeScreenshot(i)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Privacy Link */}
              <div className={s.formGroup}>
                <label className={s.label}>Tautan Privacy Policy</label>
                <p className={s.hint}>
                  URL eksternal (https://...) atau path halaman CMS
                  (/page/slug-halaman)
                </p>
                <input
                  className={s.input}
                  placeholder="/page/kebijakan-privasi atau https://..."
                  value={currentApp.customprivacylink || ""}
                  onChange={(e) =>
                    setCurrentApp({
                      ...currentApp,
                      customprivacylink: e.target.value,
                    })
                  }
                />
              </div>

              <MessageBanner />
              <button
                className={s.btn}
                onClick={handleSaveApp}
                disabled={loading || uploading}
              >
                {loading ? "Menyimpan..." : "Simpan Aplikasi"}
              </button>
            </div>
          </>
        )}

        {/* ---------- Pages List ---------- */}
        {activeTab === "pages" && (
          <>
            <div className={s.pageHeader}>
              <h1>Halaman</h1>
              <button className={s.btn} onClick={() => openPageEditor(null)}>
                + Buat Halaman
              </button>
            </div>
            <div className={s.card}>
              <div className={s.tableContainer}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Judul</th>
                      <th>URL</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.length === 0 ? (
                      <tr>
                        <td colSpan="3" className={s.emptyRow}>
                          Belum ada halaman.
                        </td>
                      </tr>
                    ) : (
                      pages.map((pg) => (
                        <tr key={pg.slug}>
                          <td>
                            <strong>{pg.title}</strong>
                          </td>
                          <td>/page/{pg.slug}</td>
                          <td>
                            <button
                              className={`${s.btnSecondary} ${s.btnSmall}`}
                              onClick={() => openPageEditor(pg)}
                            >
                              Edit
                            </button>{" "}
                            <button
                              className={`${s.btnDanger} ${s.btnSmall}`}
                              onClick={() => handleDeletePage(pg.slug)}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ---------- Page Editor ---------- */}
        {activeTab === "page_editor" && currentPageData && (
          <>
            <p className={s.breadcrumb}>
              Halaman / {currentPageData.isNew ? "Baru" : currentPageData.title}
            </p>
            <div className={s.pageHeader}>
              <h1>
                {currentPageData.isNew ? "Buat Halaman" : "Edit Halaman"}
              </h1>
              <button
                className={s.btnSecondary}
                onClick={() => setActiveTab("pages")}
              >
                ← Kembali
              </button>
            </div>
            <div className={s.card}>
              <div className={s.formGroup}>
                <label className={s.label}>Slug URL</label>
                <input
                  className={s.input}
                  value={currentPageData.slug}
                  onChange={(e) =>
                    setCurrentPageData({
                      ...currentPageData,
                      slug: e.target.value,
                    })
                  }
                  disabled={!currentPageData.isNew}
                  placeholder="contoh: kebijakan-privasi"
                />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Judul</label>
                <input
                  className={s.input}
                  value={currentPageData.title}
                  onChange={(e) =>
                    setCurrentPageData({
                      ...currentPageData,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Konten (Markdown)</label>
                <textarea
                  className={`${s.textarea} ${s.textareaCode}`}
                  value={currentPageData.content}
                  onChange={(e) =>
                    setCurrentPageData({
                      ...currentPageData,
                      content: e.target.value,
                    })
                  }
                />
              </div>
              <MessageBanner />
              <button
                className={s.btn}
                onClick={handleSavePage}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Halaman"}
              </button>
            </div>
          </>
        )}

        {/* ---------- Settings ---------- */}
        {activeTab === "settings" && (
          <>
            <div className={s.pageHeader}>
              <h1>Pengaturan</h1>
            </div>
            <div className={s.card}>
              <div className={s.formGroup}>
                <label className={s.label}>app-ads.txt</label>
                <textarea
                  className={`${s.textarea} ${s.textareaCode}`}
                  value={appAds}
                  onChange={(e) => setAppAds(e.target.value)}
                />
              </div>
              <MessageBanner />
              <button
                className={s.btn}
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
