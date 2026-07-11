"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import styles from "./admin.module.css";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [apps, setApps] = useState([]);
  const [appAds, setAppAds] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

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
    // Fetch apps
    const { data: appsData, error: appsError } = await supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (appsData) setApps(appsData);

    // Fetch app-ads
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
        isNew: true
      },
    ]);
  };

  const handleChangeApp = (index, field, value) => {
    const newApps = [...apps];
    newApps[index][field] = value;
    setApps(newApps);
  };

  const handleRemoveApp = async (index, appId) => {
    if (!confirm("Yakin ingin menghapus aplikasi ini?")) return;
    
    const newApps = [...apps];
    const appToRemove = newApps[index];
    newApps.splice(index, 1);
    setApps(newApps);

    if (!appToRemove.isNew) {
      await supabase.from('apps').delete().eq('id', appId);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: "Menyimpan perubahan ke Database...", type: "info" });

    try {
      // 1. Save Apps
      for (const app of apps) {
        const appData = {
          id: app.id,
          name: app.name,
          description: app.description,
          icon: app.icon,
          playStoreLink: app.playStoreLink,
          privacyPolicy: app.privacyPolicy,
        };

        if (app.isNew) {
          await supabase.from('apps').insert([appData]);
          app.isNew = false;
        } else {
          await supabase.from('apps').update(appData).eq('id', app.id);
        }
      }

      // 2. Save app-ads.txt
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert([{ key: 'app-ads', value: appAds }]);
        
      if (settingsError) throw settingsError;

      setMessage({ text: "Data berhasil disimpan!", type: "success" });
    } catch (err) {
      setMessage({ text: err.message || "Terjadi kesalahan", type: "error" });
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.card} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h2>Login Admin</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            {message.text && <p className={styles.helpText} style={{color: 'red'}}>{message.text}</p>}
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1>Dashboard Admin</h1>
        <p>Kelola aplikasi dan app-ads.txt Anda dengan Supabase.</p>
        <button className={styles.btnSmall} onClick={handleLogout} style={{marginTop: '1rem'}}>Logout</button>
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
              <button className={styles.btnDanger} onClick={() => handleRemoveApp(index, app.id)}>Hapus</button>
            </div>
            
            <label>ID (URL Slug)</label>
            <input className={styles.input} value={app.id} onChange={(e) => handleChangeApp(index, "id", e.target.value)} disabled={!app.isNew} />

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
          {loading ? "Menyimpan..." : "Simpan ke Database"}
        </button>
      </div>
    </div>
  );
}
