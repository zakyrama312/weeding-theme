<script setup>
import { useFormatters } from '@/Composables/useFormatters'
import { Head } from '@inertiajs/vue3'
import { ref, computed } from 'vue'
import {
    useCountdown,
    useGallery,
    useWishesPagination,
    useRevealOnScroll,
    useScrollSpy,
    useRsvpForm,
    useCopyToClipboard,
    useCalendarLink,
    useMusicPlayer,
    useOpenInvitation,
} from '@/Composables/Theme'

const { formatLongDate, formatTime } = useFormatters()

const props = defineProps({
    invitation: Object,
    guest: Object,
    isPreview: {
        type: Boolean,
        default: false,
    },
})

const audioEl = ref(null)

const photoUrl = (photo) => (photo ? `/storage/${photo}` : '/assets/foto/pengantin_1.jpeg')

// ---------------------------------------------------------------------------
// Data shaping
// ---------------------------------------------------------------------------

const groom = computed(() => props.invitation?.couples?.find((c) => c.type === 'groom'))
const bride = computed(() => props.invitation?.couples?.find((c) => c.type === 'bride'))
const akad = computed(() => props.invitation?.events?.find((e) => e.type === 'akad'))
const resepsi = computed(() => props.invitation?.events?.find((e) => e.type === 'resepsi'))

const heroDateText = computed(() => {
    const date = resepsi.value?.date ?? akad.value?.date
    if (!date) return { full: '', day: '', month: '', year: '' }
    const d = new Date(date)
    return {
        full: formatLongDate(date),
        day: d.getDate().toString().padStart(2, '0'),
        month: d.getMonth() + 1,
        year: d.getFullYear()
    }
})

const galleryImages = computed(() => {
    if (props.invitation?.galleries?.length) {
        return props.invitation.galleries.map((g) => `/storage/${g.photo}`)
    }
    return [
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=500&auto=format&fit=crop', 
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=500&auto=format&fit=crop', 
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=500&auto=format&fit=crop', 
        'https://images.unsplash.com/photo-1583939411023-14a0f5fbe5e1?q=80&w=500&auto=format&fit=crop', 
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=500&auto=format&fit=crop', 
        'https://images.unsplash.com/photo-1521543387478-6f9b6b6d3839?q=80&w=500&auto=format&fit=crop'
    ]
})

const coverPhotos = computed(() => {
    if (props.invitation?.cover_photos?.length) {
        return props.invitation.cover_photos.map((p) => photoUrl(p.photo))
    }
    return ['https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop']
})

const musicSrc = computed(() =>
    props.invitation?.music
        ? `/storage/${props.invitation.music.file_path}`
        : '/assets/music/Mitski-My-Love-Mine-All-Mine-Official-Lyric-Video.mp3'
)

const quoteText = computed(
    () =>
        props.invitation?.quote_text ??
        'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.'
)
const quoteSource = computed(() => props.invitation?.quote_source ?? 'Q.S. Ar-Rum : 21')

const wishes = computed(() => props.invitation?.wishes ?? [])

const attendanceLabel = (value) => (value === 'hadir' ? 'Hadir' : 'Tidak Hadir')
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'G'

// ---------------------------------------------------------------------------
// Behavior
// ---------------------------------------------------------------------------

const {
    days: cdDays,
    hours: cdHours,
    minutes: cdMins,
    seconds: cdSecs,
} = useCountdown(() => akad.value ?? resepsi.value)

const {
    page: wishesPage,
    totalPages: totalWishesPages,
    pagedWishes,
    pageNumbers: wishesPageNumbers,
    goToPage: goToWishesPage,
} = useWishesPagination(wishes, 5)

const { isPlaying, play: playMusic, toggle: toggleMusic } = useMusicPlayer(audioEl)

const { opened, open: openInvitation } = useOpenInvitation({
    musicPlayer: { play: playMusic },
})

const { toast: copyToast, copy: copyAccountRaw } = useCopyToClipboard()
const copyAccount = (number) => copyAccountRaw(number, 'Nomor rekening disalin!')

const { form, rsvpMessage: rsvpMsg, submit: submitWish } = useRsvpForm({
    guest: props.guest,
    isPreview: props.isPreview,
    getDomainName: () => props.invitation?.domain?.name,
})

const calendarHref = useCalendarLink({
    event: computed(() => resepsi.value ?? akad.value),
    title: computed(
        () => `The Wedding of ${groom.value?.nickname ?? groom.value?.full_name ?? ''} & ${bride.value?.nickname ?? bride.value?.full_name ?? ''}`
    ),
    details: computed(
        () => `Akad Nikah & Resepsi Pernikahan ${groom.value?.nickname ?? ''} & ${bride.value?.nickname ?? ''}`
    ),
})

useRevealOnScroll({
    activeClass: 'show',
    selector: 'section > div, section > p, section > h2, section > form, section > a, .story-item, .event-card, .bank-card, .couple-card, .ucapan-item',
})

useScrollSpy({
    activeClasses: ['active'],
    inactiveClasses: [],
})
</script>

<template>
    <Head :title="invitation?.name ?? 'Undangan Pernikahan'" />

    <audio v-if="invitation" ref="audioEl" :src="musicSrc" loop></audio>

    <div class="antialiased">

        <!-- DESKTOP SIDE (Fixed) -->
        <div class="desktop-side">
            <p class="desktop-subtitle">The Wedding Of</p>
            <h1 class="desktop-title">{{ groom?.nickname ?? groom?.full_name }} <em>&amp;</em><br>{{ bride?.nickname ?? bride?.full_name }}</h1>
        </div>

        <!-- MAIN APP CONTAINER -->
        <div id="app-wrap">

            <!-- BOTTOM NAV -->
            <nav id="bottomNav" :class="{ 'visible': opened }">
                <a href="#quote" class="nav-icon active" data-nav>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/></svg>
                    <span>Home</span>
                </a>
                <a href="#couple" class="nav-icon" data-nav>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.4-9.5-9C.8 7.4 3 4 6.5 4 9 4 11 6 12 7.3 13 6 15 4 17.5 4 21 4 23.2 7.4 21.5 11 19 15.6 12 20 12 20Z"/></svg>
                    <span>Pasangan</span>
                </a>
                <a href="#events" class="nav-icon" data-nav>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="7" width="16" height="13" rx="1.5"/><path d="M4 11h16"/><path d="M8 4v5M16 4v5"/></svg>
                    <span>Acara</span>
                </a>
                <a href="#gallery" class="nav-icon" data-nav>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>
                    <span>Galeri</span>
                </a>
                <a href="#rsvp" class="nav-icon" data-nav>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5h16v11H9l-4 3.5V16H4z"/></svg>
                    <span>Ucapan</span>
                </a>
            </nav>

            <!-- COVER / GATE -->
            <div id="cover" :class="{ 'opened': opened }" :style="`background-image: linear-gradient(180deg, rgba(10,8,6,.35), rgba(10,8,6,.75) 60%, rgba(10,8,6,.92)), url('${coverPhotos[0]}')`">
                <div class="cover-top">
                    <p class="eyebrow">The Wedding Of</p>
                    <h1 class="cover-names">{{ groom?.nickname ?? groom?.full_name }} <em>&</em><br>{{ bride?.nickname ?? bride?.full_name }}</h1>
                    <p class="to-label">Kepada Yth. Bapak/Ibu/Saudara/i</p>
                    <p class="guest-name">{{ guest?.name ?? 'Tamu Undangan' }}</p>
                </div>
                <div class="cover-bottom">
                    <button class="open-btn" @click="openInvitation">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6l8 6 8-6M4 6v12h16V6"/></svg>
                        Buka Undangan
                    </button>
                    <p class="disclaimer">*Mohon gunakan undangan ini dengan bijak, terima kasih.</p>
                </div>
            </div>

            <button v-show="opened" class="sound-toggle" :class="{'on': isPlaying}" @click="toggleMusic" aria-label="toggle music">
                <svg v-if="isPlaying" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
            </button>

            <!-- QUOTE -->
            <section id="quote" :style="`background-image: linear-gradient(180deg, rgba(20,16,13,0.3) 0%, rgba(20,16,13,0.6) 50%, rgba(20,16,13,1) 100%), url('${coverPhotos[0]}')`">
                <div class="reveal">
                    <div class="quote-date">
                        <span>{{ heroDateText.day }} / {{ heroDateText.month }}</span>
                        <span>{{ heroDateText.year }}</span>
                    </div>
                    <p class="quote-eyebrow">The Wedding Of</p>
                    <h2 class="quote-names">{{ groom?.nickname ?? groom?.full_name }} & {{ bride?.nickname ?? bride?.full_name }}</h2>
                </div>
                <div class="reveal">
                    <p class="verse">"{{ quoteText }}"</p>
                    <p class="source">{{ quoteSource }}</p>
                </div>
            </section>

            <!-- BRIDE & GROOM -->
            <section id="couple">
                <div class="section-head reveal">
                    <p class="eyebrow">Assalamu'alaikum Wr. Wb.</p>
                    <h2 class="section-title">Mempelai</h2>
                    <div class="divider"></div>
                </div>

                <div class="couple-card reveal">
                    <div class="arch-frame"><img :src="photoUrl(bride?.photo)" :alt="bride?.full_name"></div>
                    <p class="couple-role">The Bride</p>
                    <h3 class="couple-name">{{ bride?.full_name }}</h3>
                    <p class="couple-parent">Putri dari<br>Bapak {{ bride?.father_name }} & Ibu {{ bride?.mother_name }}</p>
                </div>

                <p class="and-symbol reveal">&</p>

                <div class="couple-card reveal">
                    <div class="arch-frame"><img :src="photoUrl(groom?.photo)" :alt="groom?.full_name"></div>
                    <p class="couple-role">The Groom</p>
                    <h3 class="couple-name">{{ groom?.full_name }}</h3>
                    <p class="couple-parent">Putra dari<br>Bapak {{ groom?.father_name }} & Ibu {{ groom?.mother_name }}</p>
                </div>
            </section>

            <!-- COUNTDOWN -->
            <section id="countdown">
                <p class="eyebrow reveal">Save The Date</p>
                <p class="date-big reveal">{{ heroDateText.day }} · {{ heroDateText.month }} · {{ heroDateText.year }}</p>
                <div class="timer reveal" id="timer">
                    <div class="box"><div class="num">{{ cdDays }}</div><div class="lbl">Hari</div></div>
                    <div class="box"><div class="num">{{ cdHours }}</div><div class="lbl">Jam</div></div>
                    <div class="box"><div class="num">{{ cdMins }}</div><div class="lbl">Menit</div></div>
                    <div class="box"><div class="num">{{ cdSecs }}</div><div class="lbl">Detik</div></div>
                </div>
                <a class="cal-btn reveal" :href="calendarHref" target="_blank">Simpan Tanggal</a>
            </section>

            <!-- EVENTS -->
            <section id="events">
                <div class="section-head reveal">
                    <p class="eyebrow">Wedding Event</p>
                    <h2 class="section-title">Rangkaian Acara</h2>
                    <div class="divider"></div>
                </div>

                <div v-if="akad" class="event-card reveal">
                    <p class="event-day">Akad Nikah</p>
                    <p class="event-date">{{ new Date(akad.date).getDate() }}</p>
                    <p class="event-month">{{ new Date(akad.date).toLocaleString('id-ID', { month: 'long', year: 'numeric' }) }}</p>
                    <p class="event-time">{{ formatTime(akad.time) }} WIB — Selesai</p>
                    <div class="event-loc">
                        <b>{{ akad.place }}</b>
                        {{ akad.address }}
                    </div>
                    <a v-if="invitation?.maps_link" class="map-link" :href="invitation.maps_link" target="_blank">Lihat Google Maps</a>
                </div>

                <div v-if="resepsi" class="event-card reveal">
                    <p class="event-day">Resepsi</p>
                    <p class="event-date">{{ new Date(resepsi.date).getDate() }}</p>
                    <p class="event-month">{{ new Date(resepsi.date).toLocaleString('id-ID', { month: 'long', year: 'numeric' }) }}</p>
                    <p class="event-time">{{ formatTime(resepsi.time) }} WIB — Selesai</p>
                    <div class="event-loc">
                        <b>{{ resepsi.place }}</b>
                        {{ resepsi.address }}
                    </div>
                    <a v-if="invitation?.maps_link" class="map-link" :href="invitation.maps_link" target="_blank">Lihat Google Maps</a>
                </div>
            </section>

            <!-- DRESSCODE -->
            <section id="dresscode">
                <p class="eyebrow reveal">Dresscode</p>
                <h2 class="section-title reveal">Warna Busana</h2>
                <div class="divider reveal"></div>
                <p class="closing-thanks reveal" style="max-width:300px; margin-left:auto; margin-right:auto;">Kami dengan hormat menganjurkan tamu undangan mengenakan salah satu warna berikut.</p>
                <div class="swatches reveal">
                    <div class="swatch" style="background:#2E3B2A;"></div>
                    <div class="swatch" style="background:#B8935A;"></div>
                    <div class="swatch" style="background:#E7D8BE;"></div>
                    <div class="swatch" style="background:#14100D;"></div>
                </div>
            </section>

            <!-- LOVE STORY -->
            <section id="story">
                <div class="section-head reveal">
                    <p class="eyebrow">Our Journey</p>
                    <h2 class="section-title">Love Story</h2>
                    <div class="divider"></div>
                </div>

                <div v-for="item in invitation.love_stories" :key="item.id" class="story-item reveal">
                    <img :src="photoUrl(bride?.photo)" alt="">
                    <div>
                        <p class="story-date">{{ item.title }}</p>
                        <p class="story-text">{{ item.description }}</p>
                    </div>
                </div>
            </section>

            <!-- GALLERY -->
            <section id="gallery">
                <div class="section-head reveal">
                    <p class="eyebrow">Gallery</p>
                    <h2 class="section-title">Our Moments</h2>
                    <div class="divider"></div>
                </div>
                <div class="gal-grid reveal">
                    <a v-for="(img, idx) in galleryImages" :key="idx" :href="img" target="_blank">
                        <img :src="img">
                    </a>
                </div>
            </section>

            <!-- GIFT -->
            <section v-if="invitation?.accounts?.length" id="gift">
                <p class="eyebrow reveal">Wedding Gift</p>
                <h2 class="section-title reveal">Tanda Kasih</h2>
                <div class="divider reveal"></div>
                <p class="closing-thanks reveal" style="max-width:300px; margin:0 auto 30px;">Doa restu Anda adalah karunia yang sangat berarti. Jika ingin memberi tanda kasih, silakan melalui rekening berikut.</p>

                <div v-for="account in invitation.accounts" :key="account.id" class="bank-card reveal">
                    <div>
                        <p class="bi">{{ account.bank_name }}</p>
                        <p class="num">{{ account.account_number }}</p>
                        <p class="an">a.n. {{ account.account_holder }}</p>
                    </div>
                    <button class="copy-btn" @click="copyAccount(account.account_number)">Salin</button>
                </div>
                
                <div v-if="invitation?.gift_address" class="bank-card reveal mt-4">
                    <div>
                        <p class="bi" style="color: var(--gold-light);">Kirim Kado Fisik</p>
                        <p class="num" style="font-size: 16px; margin-top: 6px; font-family: 'Jost';">{{ invitation.gift_address.receiver_name }}</p>
                        <p class="an" style="color: var(--blush); font-size: 12px; margin-top: 4px;">{{ invitation.gift_address.address }}</p>
                        <p v-if="invitation.gift_address.phone" class="an" style="opacity: 0.7; margin-top: 2px;">{{ invitation.gift_address.phone }}</p>
                    </div>
                </div>

                <p class="rsvp-note reveal text-center" style="color: var(--gold-light); margin-top: 16px; min-height: 20px; transition: opacity 0.3s;" :style="{ opacity: copyToast ? 1 : 0 }">{{ copyToast }}</p>
            </section>

            <!-- RSVP -->
            <section id="rsvp">
                <div class="section-head reveal">
                    <p class="eyebrow">Ucapan & RSVP</p>
                    <h2 class="section-title">Konfirmasi Kehadiran</h2>
                    <div class="divider"></div>
                </div>
                <form @submit.prevent="submitWish" class="reveal">
                    <div class="field">
                        <label>Nama</label>
                        <input v-model="form.name" type="text" required placeholder="Nama Anda">
                    </div>
                    <div class="field">
                        <label>Konfirmasi Kehadiran</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input v-model="form.attendance" type="radio" name="attendance" value="hadir" required>
                                <div class="radio-btn">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Hadir
                                </div>
                            </label>
                            <label class="radio-label">
                                <input v-model="form.attendance" type="radio" name="attendance" value="tidak_hadir">
                                <div class="radio-btn">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                                    Tidak Hadir
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="field">
                        <label>Ucapan</label>
                        <textarea v-model="form.message" required placeholder="Tulis doa & ucapan untuk mempelai..."></textarea>
                    </div>
                    <button class="submit-btn" type="submit" :disabled="form.processing">Kirim Ucapan</button>
                    <p class="rsvp-note">{{ rsvpMsg }}</p>
                </form>

                <div class="ucapan-list reveal">
                    <div v-if="!wishes.length" class="text-center text-sm" style="color: var(--blush); opacity: 0.6;">Jadilah yang pertama mengirim ucapan.</div>
                    
                    <div v-for="wish in pagedWishes" :key="wish.id" class="ucapan-item">
                        <div class="ucapan-avatar">{{ getInitials(wish.name) }}</div>
                        <div class="ucapan-content">
                            <div class="ucapan-header">
                                <span class="ucapan-name">{{ wish.name }}</span>
                                <span class="ucapan-badge" :class="wish.attendance === 'hadir' ? 'badge-hadir' : 'badge-absen'">{{ attendanceLabel(wish.attendance) }}</span>
                            </div>
                            <p class="ucapan-text">{{ wish.message }}</p>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="wishes.length" class="pagination reveal">
                    <button
                        @click="goToWishesPage(wishesPage - 1)"
                        :disabled="wishesPage === 1"
                        class="page-btn"
                        :class="wishesPage === 1 ? 'disabled' : ''"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    
                    <button
                        v-for="p in wishesPageNumbers"
                        :key="p"
                        @click="goToWishesPage(p)"
                        class="page-btn"
                        :class="p === wishesPage ? 'active' : ''"
                    >
                        {{ p }}
                    </button>
                    
                    <button
                        @click="goToWishesPage(wishesPage + 1)"
                        :disabled="wishesPage === totalWishesPages"
                        class="page-btn"
                        :class="wishesPage === totalWishesPages ? 'disabled' : ''"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
            </section>

            <!-- CLOSING -->
            <section id="closing">
                <p class="eyebrow reveal">Terima Kasih</p>
                <p class="closing-thanks reveal">Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.<br><br>Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>
                <h2 class="closing-names reveal">{{ groom?.nickname ?? groom?.full_name }} & {{ bride?.nickname ?? bride?.full_name }}</h2>
            </section>

            <footer>Undangan Digital · dibuat dengan ♡</footer>
        </div>
    </div>
</template>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
  
  :root{
    --ink:#14100D;
    --ivory:#F4EEE3;
    --gold:#B8935A;
    --gold-light:#D9C39B;
    --moss:#2E3B2A;
    --blush:#E7D8BE;
    --bronze:#8A7355;
    --shadow: 0 20px 60px rgba(0,0,0,0.35);
  }
  
  html{scroll-behavior:smooth;}
  
  .antialiased {
    background:var(--ink);
    font-family:'Jost', sans-serif;
    color:var(--ivory);
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
    padding-bottom:80px;
    min-height: 100vh;
  }
  
  #app-wrap {
    width: 100%;
    min-height: 100vh;
    background: var(--ink);
    position: relative;
    overflow-x: hidden;
    box-shadow: -10px 0 30px rgba(0,0,0,0.5);
  }
  
  @media(min-width: 1024px) {
    #app-wrap {
      width: 420px;
      margin-left: auto;
    }
    .antialiased { padding: 0; }
  }

  .desktop-side {
    display: none;
  }
  @media(min-width: 1024px) {
    .desktop-side {
      display: flex;
      position: fixed;
      top: 0; bottom: 0; left: 0; right: 420px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg,#0c0a08,#1a1512 40%,#0c0a08);
      border-right: 1px solid rgba(217, 195, 155, 0.15);
      overflow: hidden;
      z-index: 0;
    }
  }
  
  .desktop-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 72px;
    color: var(--gold-light);
    line-height: 1.1;
    text-align: center;
    text-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }
  .desktop-subtitle {
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--blush);
    margin-bottom: 16px;
  }

  /* bottom navbar */
  #bottomNav{
    position:fixed; left:50%; transform:translateX(-50%); bottom:env(safe-area-inset-bottom, 24px); z-index:50;
    width:calc(100% - 48px); max-width:360px;
    background:rgba(20,16,13,0.85);
    backdrop-filter:blur(16px);
    -webkit-backdrop-filter:blur(16px);
    border:1px solid rgba(217,195,155,0.25);
    border-radius:9999px;
    box-shadow:0 12px 40px rgba(0,0,0,0.3);
    display:flex; justify-content:space-around; align-items:center;
    padding:12px 8px;
    opacity:0; pointer-events:none; transition:opacity 0.8s ease;
  }
  #bottomNav.visible { opacity:1; pointer-events:auto; }
  @media(min-width:1024px){
    #bottomNav{ left:auto; right:30px; transform:none; }
  }
  .nav-icon{display:flex; flex-direction:column; align-items:center; gap:4px; color:rgba(244,238,227,0.45); transition:all .3s ease; width:44px; text-decoration:none;}
  .nav-icon svg{width:20px; height:20px; stroke:currentColor;}
  .nav-icon span{font-size:9px; letter-spacing:.05em; text-transform:uppercase; font-weight:500;}
  .nav-icon.active{color:var(--gold-light); transform:translateY(-3px);}

  h1,h2,h3,.serif{ font-family:'Cormorant Garamond', serif; }
  .eyebrow{
    font-size:11px; letter-spacing:.32em; text-transform:uppercase;
    color:var(--gold-light); font-weight:400;
  }
  .divider{
    width:44px; height:1px; background:var(--gold);
    margin:18px auto; opacity:.8;
  }
  .divider.wide{ width:80px; }

  /* ---------- COVER (gate) ---------- */
  #cover{
    position:fixed; top:0; bottom:0; right:0; left:auto; width:100%; z-index:50;
    background-size: cover; background-position: center; background-repeat: no-repeat;
    display:flex; flex-direction:column; align-items:center; justify-content:space-between;
    text-align:center; padding:48px 32px 40px; transition:transform .9s cubic-bezier(.65,0,.35,1), opacity .8s ease;
  }
  @media(min-width:1024px){
    #cover { width:420px; }
  }
  #cover.opened{ transform:translateY(-100%); opacity:0; pointer-events:none; }
  .cover-top .eyebrow{ color:var(--gold-light); }
  .cover-names{ font-size:52px; font-weight:400; line-height:1.15; margin-top:10px; }
  .cover-names em{ font-style:italic; color:var(--gold-light); }
  .to-label{ font-size:12px; letter-spacing:.1em; color:var(--blush); opacity:.85; margin-top:6px;}
  .guest-name{ font-family:'Cormorant Garamond', serif; font-size:22px; font-style:italic; margin-top:6px; color:var(--gold-light);}
  .cover-bottom{ display:flex; flex-direction:column; align-items:center; gap:14px; }
  .open-btn{
    font-family:'Jost'; font-size:12px; letter-spacing:.24em; text-transform:uppercase;
    color:var(--ink); background:var(--gold-light);
    border:none; padding:16px 34px; border-radius:2px; cursor:pointer;
    display:flex; align-items:center; gap:10px;
    box-shadow:0 8px 24px rgba(184,147,90,.35);
  }
  .open-btn svg{ width:14px; height:14px; }
  .disclaimer{ font-size:10px; color:var(--blush); opacity:.6; max-width:260px; }

  /* ---------- SECTIONS ---------- */
  section{ padding:88px 32px; position:relative; }
  .section-head{ text-align:center; margin-bottom:36px; }
  .section-title{ font-size:34px; font-weight:400; margin-top:8px; }

  /* hero-ish quote section with bg photo */
  #quote{
    background-size: cover; background-position: center; background-repeat: no-repeat;
    text-align:center;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px 24px 100px;
  }
  .quote-date {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    letter-spacing: 0.2em;
    font-weight: 500;
    margin-bottom: 32px;
  }
  .quote-eyebrow {
    color: var(--ivory);
    margin-bottom: 4px;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
  }
  .quote-names {
    font-size: 46px;
    font-weight: 400;
  }
  #quote p.verse{ font-family:'Jost', sans-serif; font-style:italic; font-size:13px; line-height:1.6; color:var(--ivory); opacity: 0.9; }
  #quote p.source{ margin-top:16px; font-size:13px; font-weight: 600; font-style: italic; letter-spacing: 0.05em; color:var(--ivory); }

  /* couple */
  #couple{ background:var(--ink); }
  .couple-card{
    display:flex; flex-direction:column; align-items:center; text-align:center;
    margin-bottom:56px;
  }
  .arch-frame{
    width:190px; height:240px;
    border-radius:95px 95px 6px 6px;
    overflow:hidden; border:1px solid var(--gold);
    padding:8px; position:relative;
  }
  .arch-frame img{
    width:100%; height:100%; object-fit:cover;
    border-radius:88px 88px 2px 2px;
    display:block;
  }
  .couple-role{ margin-top:22px; font-size:11px; letter-spacing:.28em; color:var(--gold-light); text-transform:uppercase;}
  .couple-name{ font-size:30px; margin-top:8px; }
  .couple-parent{ font-size:13px; color:var(--blush); margin-top:10px; line-height:1.6; opacity:.85; }
  .ig-link{
    margin-top:14px; font-size:11px; letter-spacing:.12em; color:var(--gold-light);
    text-decoration:none; border-bottom:1px solid var(--gold); padding-bottom:2px;
  }
  .and-symbol{ font-family:'Cormorant Garamond'; font-style:italic; font-size:30px; color:var(--gold); margin:-10px 0 40px; text-align:center;}

  /* countdown */
  #countdown{
    background:linear-gradient(180deg, rgba(20,16,13,.6), rgba(20,16,13,.9)),
      url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop') center/cover no-repeat;
    text-align:center;
  }
  .date-big{ font-size:56px; letter-spacing:.05em; }
  .timer{ display:flex; justify-content:center; gap:14px; margin-top:32px; }
  .timer .box{ background:rgba(244,238,227,.06); border:1px solid var(--gold); padding:14px 10px; border-radius:4px; min-width:62px; }
  .timer .num{ font-size:24px; font-family:'Cormorant Garamond'; }
  .timer .lbl{ font-size:9px; letter-spacing:.15em; text-transform:uppercase; color:var(--gold-light); margin-top:4px; }
  .cal-btn{
    margin-top:34px; display:inline-block; font-size:11px; letter-spacing:.2em; text-transform:uppercase;
    color:var(--ink); background:var(--gold-light); padding:14px 26px; border-radius:2px; text-decoration:none;
  }

  /* events */
  #events{ background:var(--ink); }
  .event-card{
    border:1px solid rgba(184,147,90,.35); border-radius:6px; padding:32px 26px;
    text-align:center; margin-bottom:26px; background:rgba(184,147,90,.04);
  }
  .event-day{ font-size:11px; letter-spacing:.2em; color:var(--gold-light); text-transform:uppercase; }
  .event-date{ font-size:40px; margin:6px 0 2px; }
  .event-month{ font-size:13px; letter-spacing:.15em; color:var(--blush); text-transform:uppercase; }
  .event-time{ margin-top:14px; font-size:15px; color:var(--gold-light); }
  .event-loc{ margin-top:16px; font-size:14px; line-height:1.6; color:var(--ivory); }
  .event-loc b{ font-family:'Cormorant Garamond'; font-size:18px; font-weight:500; display:block; margin-bottom:2px;}
  .map-link{ display:inline-block; margin-top:14px; font-size:11px; letter-spacing:.15em; color:var(--gold-light); border-bottom:1px solid var(--gold); text-decoration:none; padding-bottom:2px;}

  /* dresscode */
  #dresscode{ text-align:center; }
  .swatches{ display:flex; justify-content:center; gap:14px; margin-top:26px; }
  .swatch{ width:46px; height:46px; border-radius:50%; border:1px solid rgba(244,238,227,.3); }

  /* love story */
  #story{ background:var(--ink); }
  .story-item{ display:flex; gap:18px; margin-bottom:44px; align-items:flex-start; }
  .story-item img{ width:96px; height:96px; object-fit:cover; border-radius:50%; border:1px solid var(--gold); flex-shrink:0; }
  .story-date{ font-size:11px; letter-spacing:.15em; color:var(--gold-light); text-transform:uppercase; }
  .story-text{ font-size:14px; line-height:1.7; color:var(--blush); margin-top:8px; }

  /* gallery */
  #gallery{ padding-left:12px; padding-right:12px; }
  .gal-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .gal-grid img{ width:100%; height:150px; object-fit:cover; border-radius:2px; }
  .gal-grid a:nth-child(3n+1) img{ height:220px; }

  /* gift */
  #gift{ background:var(--ink); text-align:center; }
  .bank-card{
    border:1px solid rgba(184,147,90,.35); border-radius:6px; padding:22px;
    display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;
    background:rgba(184,147,90,.04); text-align:left;
  }
  .bank-card .bi{ font-size:11px; color:var(--blush); opacity:.75; }
  .bank-card .num{ font-family:'Cormorant Garamond'; font-size:20px; letter-spacing:.05em; margin:4px 0; }
  .bank-card .an{ font-size:12px; color:var(--gold-light); }
  .copy-btn{
    font-size:10px; letter-spacing:.15em; text-transform:uppercase; color:var(--ink);
    background:var(--gold-light); border:none; padding:9px 16px; border-radius:2px; cursor:pointer; white-space:nowrap;
  }

  /* rsvp */
  #rsvp{ background:var(--ink); }
  .field{ margin-bottom:18px; }
  .field label{ font-size:11px; letter-spacing:.15em; text-transform:uppercase; color:var(--gold-light); display:block; margin-bottom:8px;}
  .field input, .field select, .field textarea{
    width:100%; background:transparent; border:none; border-bottom:1px solid rgba(244,238,227,.3);
    color:var(--ivory); font-family:'Jost'; font-size:14px; padding:10px 2px; outline:none;
  }
  .field textarea{ resize:vertical; min-height:70px; }
  .radio-group { display: flex; gap: 10px; margin-top: 8px; }
  .radio-label { flex: 1; cursor: pointer; }
  .radio-label input { display: none; }
  .radio-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 12px; font-size: 13px; letter-spacing: 0.1em;
    background: transparent; border: 1px solid rgba(184,147,90,0.5);
    color: var(--blush); border-radius: 4px; transition: all 0.3s ease;
  }
  .radio-btn svg { width: 16px; height: 16px; opacity: 0.5; }
  .radio-label input:checked + .radio-btn {
    background: var(--gold-light); color: var(--ink); border-color: var(--gold-light);
  }
  .radio-label input:checked + .radio-btn svg { opacity: 1; }
  
  .submit-btn{
    width:100%; margin-top:8px; padding:16px; font-size:12px; letter-spacing:.22em; text-transform:uppercase;
    background:var(--gold-light); color:var(--ink); border:none; border-radius:4px; cursor:pointer;
  }
  .submit-btn:disabled{ opacity:0.6; cursor:not-allowed; }
  .rsvp-note{ font-size:11px; color:var(--blush); opacity:.7; margin-top:14px; text-align:center; }

  .ucapan-list {
    margin-top: 32px; max-height: 360px; overflow-y: auto; padding-right: 4px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .ucapan-list::-webkit-scrollbar { display: none; }
  .ucapan-list { -ms-overflow-style: none; scrollbar-width: none; }
  
  .ucapan-item {
    background: rgba(244,238,227,0.04); border: 1px solid rgba(184,147,90,0.25);
    border-radius: 8px; padding: 16px; display: flex; gap: 14px; text-align: left;
  }
  .ucapan-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--gold-light); color: var(--ink);
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 12px; flex-shrink: 0;
  }
  .ucapan-content { flex: 1; }
  .ucapan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .ucapan-name { font-size: 14px; font-weight: 500; color: var(--gold-light); }
  .ucapan-badge { font-size: 9px; padding: 3px 8px; border-radius: 12px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
  .badge-hadir { background: var(--gold-light); color: var(--ink); }
  .badge-absen { background: rgba(244,238,227,0.15); color: var(--blush); }
  .ucapan-text { font-size: 13px; line-height: 1.5; color: var(--blush); opacity: 0.85; }

  .pagination {
    display: flex; justify-content: center; gap: 8px; margin-top: 24px;
  }
  .page-btn {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(184,147,90,0.4); background: transparent;
    color: var(--gold-light); font-size: 12px; font-weight: 600; font-family: 'Jost', sans-serif;
    cursor: pointer; transition: all 0.3s ease;
  }
  .page-btn svg { width: 14px; height: 14px; stroke: currentColor; }
  .page-btn.active {
    background: var(--gold-light); color: var(--ink); border-color: var(--gold-light);
  }
  .page-btn.disabled {
    opacity: 0.3; cursor: not-allowed; border-color: rgba(244,238,227,0.2); color: rgba(244,238,227,0.4);
  }
  .page-btn:not(.active):not(.disabled):hover {
    background: rgba(184,147,90,0.15);
  }

  /* Animations */
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.8s ease, transform 0.8s ease; }
  .reveal.show { opacity: 1; transform: translateY(0); }

  /* closing */
  #closing{
    background:linear-gradient(180deg, rgba(20,16,13,.55), rgba(20,16,13,.92)),
      url('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200&auto=format&fit=crop') center/cover no-repeat;
    text-align:center; padding-bottom:64px;
  }
  .closing-thanks{ font-size:14px; color:var(--blush); line-height:1.8; margin-top:10px; }
  .closing-names{ font-size:34px; margin-top:26px; }
  footer{ text-align:center; padding:24px; font-size:10px; letter-spacing:.15em; color:var(--bronze); }

  .sound-toggle{
    position:fixed; top:18px; right:18px; z-index:40;
    width:38px; height:38px; border-radius:50%; border:1px solid var(--gold);
    background:rgba(20,16,13,.55); color:var(--gold-light); display:flex; align-items:center; justify-content:center;
    cursor:pointer;
  }
  .sound-toggle.on {
    background: var(--gold-light);
    color: var(--ink);
  }
</style>
