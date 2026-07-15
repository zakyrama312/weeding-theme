# Arsitektur & Best Practice Tema Dinamis Undangan Digital (Laravel + Vue)

Di dunia nyata (level *production*), kita memang **tidak disarankan** membuat satu file HTML raksasa hingga ribuan baris untuk setiap tema. Agar sistem tema ini dinamis, modular (terpisah-pisah), dan mudah diganti-ganti (*best practice*), kita bisa menerapkan arsitektur **Component-Based & Data-Driven** menggunakan kombinasi Laravel dan Vue.

Berikut adalah gambaran arsitektur dan langkah-langkah *best practice*-nya:

## 1. Pecah Menjadi Komponen-Komponen Kecil (Vue Components)
Alih-alih menggunakan satu file HTML raksasa, pecah file tersebut menjadi beberapa file `.vue` berukuran kecil yang fokus pada satu bagian saja.

**Contoh struktur file di Vue:**
```text
resources/js/
├── Components/
│   ├── Invitation/
│   │   ├── CoverEnvelope.vue  (Bagian amplop depan)
│   │   ├── HeroSection.vue    (Header/Banner nama)
│   │   ├── CoupleSection.vue  (Info mempelai)
│   │   ├── EventSection.vue   (Jadwal acara & Countdown)
│   │   ├── LoveStory.vue      (Cerita cinta)
│   │   ├── Gallery.vue        (Galeri foto)
│   │   ├── RsvpForm.vue       (Form kehadiran & ucapan)
│   │   └── AudioPlayer.vue    (Tombol play musik)
```

Di dalam file *parent* utamanya (misalnya `InvitationView.vue`), kita tinggal merangkai komponen-komponen tersebut seperti menyusun balok lego:

```vue
<template>
  <div :class="theme.containerClass" :style="cssVariables">
    <CoverEnvelope v-if="!isOpened" @open="openInvitation" />
    
    <div v-else>
      <AudioPlayer :src="invitation.audio_url" />
      <HeroSection :data="invitation" />
      <CoupleSection :data="invitation.couple" />
      <EventSection :events="invitation.events" />
      <!-- dan komponen lainnya -->
    </div>
  </div>
</template>
```

## 2. Gunakan CSS Variables yang Dinamis (Data-Driven Styling)
Daripada nge-*hardcode* warna langsung di CSS seperti `--ink: #4A2C59;`, simpan konfigurasi warna dan *font* tema di database Laravel, lalu *inject* (suntikkan) ke Vue sebagai *CSS variables* (`:style`). 

Dengan cara ini, 1 baris kode komponen Vue bisa berubah menjadi puluhan tema hanya dengan mengganti JSON dari database!

**Data Tema dari Laravel (contoh respon JSON API):**
```json
{
  "theme_id": "butterfly_special",
  "name": "Kupu-Kupu Ungu",
  "colors": {
    "--ink": "#4A2C59",
    "--primary": "#9B6B9E",
    "--primary-soft": "#E8D5EC",
    "--cream": "#FFF9FC"
  },
  "fonts": {
    "heading": "'Tangerine', cursive",
    "body": "'Jost', sans-serif"
  },
  "ornaments": {
    "corner_top_left": "/assets/butterfly/corner1.png",
    "animation_type": "butterfly_fall"
  }
}
```

## 3. Dynamic Component (Ganti Tema Secara Layout)
Terkadang, tema A dan tema B letaknya sangat berbeda secara struktural (bukan sekadar beda warna). Di Vue, kita bisa menggunakan **Dynamic Components** `<component :is="...">` untuk memuat *layout* komponen secara otomatis sesuai data dari Laravel.

```vue
<!-- Memanggil komponen berdasarkan jenis tema dari database -->
<component :is="currentThemeLayout" :invitation="invitationData" />
```

```javascript
// Di dalam script Vue:
computed: {
  currentThemeLayout() {
    // Jika user memilih tema butterfly, akan memuat ButterflyLayout.vue
    // Jika memilih classic, memuat ClassicLayout.vue
    return this.invitationData.theme.layout_name; 
  }
}
```

## 4. Peran Backend (Laravel API atau Inertia.js)
Backend (Laravel) di sini hanya bertugas melayani dan menyiapkan data.
- **Tabel `themes`**: Menyimpan konfigurasi warna, font, dan aset file.
- **Tabel `invitations`**: Menyimpan nama mempelai, tanggal acara, galeri foto, dan relasi/Foreign Key ke `theme_id`.
- Saat halaman diakses (misal `/invitation/ayu-bagas`), Laravel Query Builder mengambil data dari database lalu mem-*passing*-nya ke Vue. Pendekatan modern yang paling direkomendasikan saat ini adalah menggunakan **Inertia.js** agar tidak perlu repot-repot membuat API Endpoint tersendiri.

---

### 🔥 Keuntungan Utama Menggunakan Pendekatan Ini:
1. **Sangat Ringan & Rapih (Maintainable)**: Kalau ada *error* di bagian galeri, developer cukup membuka file `Gallery.vue` (yang isinya mungkin hanya 50 baris), tidak perlu pusing mencari kode di dalam file raksasa berisi ribuan baris.
2. **Sangat Skalabel (Scalable)**: Mau rilis tema baru? Tidak perlu bikin file HTML/Vue baru dari nol. Cukup tambahkan **1 baris data di database Laravel** (mengubah hex warna dan mengganti link ornamen), dan seketika tema baru tercipta.
3. **Reusability Tinggi**: Fitur logik seperti hitung mundur (*countdown*), form RSVP, dan pemutar musik bisa dipakai ulang di SEMUA tema tanpa perlu menulis ulang atau menempel (*copy-paste*) kode JavaScript berulang kali.
