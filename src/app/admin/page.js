"use client";
import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import appsDataJson from "../../../data/apps.json";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [apps, setApps] = useState(appsDataJson);
  const [appAds, setAppAds] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetch("/app-ads.txt")
      .then((res) => res.text())
      .then((text) => setAppAds(text))
      .catch(() => setAppAds(""));
  }, []);

  const handleAddApp = () => {
    setApps([
      ...apps,
      {
        id: "app-baru",
        name: "Aplikasi Baru",
        description: "",
        icon: "📱",
        playStoreLink: "",
        privacyPolicy: "# Privacy Policy",
      },
    ]);
  };

  const handleChangeApp = (index, field, value) => {
    const newApps = [...apps];
    newApps[index][field] = value;
    setApps(newApps);
  };

  const handleRemoveApp = (index) => {
    const newApps = [...apps];
    newApps.splice(index, 1);
    setApps(newApps);
  };

  const handleSave = async () => {
    if (!token) {
      setMessage({ text: "GitHub Token wajib diisi!", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "Menyimpan perubahan ke GitHub...", type: "info" });

    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          appsData: apps,
          appAdsText: appAds,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: "success" });
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Terjadi kesalahan jaringan.", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1>Dashboard Admin</h1>
        <p>Kelola aplikasi dan app-ads.txt Anda langsung dari sini.</p>
      </div>

      <div className={styles.card}>
        <h2>Autentikasi GitHub</h2>
        <p className={styles.helpText}>
          Masukkan Personal Access Token (PAT) GitHub Anda dengan akses "repo" untuk menyimpan perubahan.
        </p>
        <input
          type="password"
          className={styles.input}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>

      <div className={styles.card}>
        <div className={styles.flexBetween}>
          <h2>Daftar Aplikasi</h2>
          <button className={styles.btnSmall} onClick={handleAddApp}>+ Tambah Aplikasi</button>
        </div>

        {apps.map((app, index) => (
          <div key={index} className={styles.appEditCard}>
            <div className={styles.flexBetween}>
              <h3>Aplikasi {index + 1}</h3>
              <button className={styles.btnDanger} onClick={() => handleRemoveApp(index)}>Hapus</button>
            </div>
            
            <label>ID (URL Slug)</label>
            <input className={styles.input} value={app.id} onChange={(e) => handleChangeApp(index, "id", e.target.value)} />

            <label>Nama Aplikasi</label>
            <input className={styles.input} value={app.name} onChange={(e) => handleChangeApp(index, "name", e.target.value)} />

            <label>Deskripsi Singkat</label>
            <textarea className={styles.textarea} value={app.description} onChange={(e) => handleChangeApp(index, "description", e.target.value)} />

            <label>Ikon (Emoji atau URL Gambar)</label>
            <input className={styles.input} value={app.icon} onChange={(e) => handleChangeApp(index, "icon", e.target.value)} />

            <label>Play Store Link</label>
            <input className={styles.input} value={app.playStoreLink} onChange={(e) => handleChangeApp(index, "playStoreLink", e.target.value)} />

            <label>Privacy Policy (Markdown)</label>
            <textarea className={styles.textareaLarge} value={app.privacyPolicy} onChange={(e) => handleChangeApp(index, "privacyPolicy", e.target.value)} />
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <h2>app-ads.txt</h2>
        <p className={styles.helpText}>Edit isi file app-ads.txt untuk AdMob atau jaringan iklan lainnya.</p>
        <textarea
          className={styles.textareaLarge}
          value={appAds}
          onChange={(e) => setAppAds(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
        <button 
          className={`${styles.btn} ${loading ? styles.loading : ''}`} 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan (Push ke GitHub)"}
        </button>
      </div>
    </div>
  );
}
