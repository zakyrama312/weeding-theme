<script setup>
import { useFormatters } from '@/Composables/useFormatters'
import { Head } from '@inertiajs/vue3'
import { ref, computed, watch } from 'vue'
import {
    useCountdown,
    useCoverCarousel,
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
const petalsContainer = ref(null)
const thumbsWrap = ref(null)

const photoUrl = (photo) => (photo ? `/storage/${photo}` : '/assets/foto/pengantin_1.jpeg')

// ---------------------------------------------------------------------------
// Data shaping
// ---------------------------------------------------------------------------

const groom = computed(() => props.invitation?.couples?.find((c) => c.type === 'groom'))
const bride = computed(() => props.invitation?.couples?.find((c) => c.type === 'bride'))
const akad = computed(() => props.invitation?.events?.find((e) => e.type === 'akad'))
const resepsi = computed(() => props.invitation?.events?.find((e) => e.type === 'resepsi'))

const heroDateText = computed(() => formatLongDate(resepsi.value?.date ?? akad.value?.date))

const galleryImages = computed(() => {
    if (props.invitation?.galleries?.length) {
        return props.invitation.galleries.map((g) => `/storage/${g.photo}`)
    }
    return [
        '/assets/foto/pengantin_1.jpeg', 
        '/assets/foto/pengantin_2.jpeg', 
        '/assets/foto/pengantin_3.jpeg', 
        '/assets/foto/pengantin_1.jpeg', 
        '/assets/foto/pengantin_2.jpeg', 
        '/assets/foto/pengantin_3.jpeg'
    ]
})

const coverPhotos = computed(() => {
    if (props.invitation?.cover_photos?.length) {
        return props.invitation.cover_photos.map((p) => photoUrl(p.photo))
    }
    return ['/assets/foto/pengantin_1.jpeg']
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

// ---------------------------------------------------------------------------
// Behavior
// ---------------------------------------------------------------------------

const {
    days: cdDays,
    hours: cdHours,
    minutes: cdMins,
    seconds: cdSecs,
} = useCountdown(() => akad.value ?? resepsi.value)

const { activeIndex: activeCoverIndex } = useCoverCarousel(coverPhotos)

const {
    currentIndex: currentGalIdx,
    mainImage: mainGalleryImg,
    thumbsWrap: galleryThumbsWrap,
    next: nextGallery,
    prev: prevGallery,
    set: setGallery,
} = useGallery(galleryImages)
thumbsWrap.value = galleryThumbsWrap.value

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

watch(opened, (newVal) => {
    if (newVal) {
        spawnPetals()
    }
})

function spawnPetals() {
    if (!petalsContainer.value) return
    const container = petalsContainer.value
    const colors = ['#F28482', '#F6BD60', '#84A59D'];
    for(let i=0;i<15;i++){
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random()*100+'%';
        p.style.width = (12+Math.random()*15)+'px';
        p.style.animationDuration = (10+Math.random()*12)+'s';
        p.style.animationDelay = (Math.random()*10)+'s';
        const color = colors[Math.floor(Math.random() * colors.length)];
        p.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}"><path d="M12 2c3 3 3 7 0 10-3-3-3-7 0-10z"/></svg>`;
        container.appendChild(p);
    }
}

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

useRevealOnScroll()
useScrollSpy({
    activeClasses: ['active'],
    inactiveClasses: [],
})
</script>

<template>
    <Head :title="invitation?.name ?? 'Undangan Pernikahan'" />

    <audio v-if="invitation" ref="audioEl" :src="musicSrc" loop></audio>

    <div class="antialiased font-['Poppins',sans-serif] bg-[var(--cream)] text-[var(--ink)] overflow-x-hidden pb-[100px]">

        <!-- DESKTOP LEFT SIDE (Fixed) -->
        <div class="hidden lg:flex fixed inset-y-0 left-0 right-[420px] flex-col items-center justify-center bg-[var(--cream)] overflow-hidden border-r border-white">
            
            <!-- Blobs -->
            <div class="blob w-96 h-96 bg-[var(--coral)] top-[-10%] left-[-10%]"></div>
            <div class="blob w-80 h-80 bg-[var(--yellow)] bottom-[-10%] right-[-10%]"></div>
            <div class="blob w-64 h-64 bg-[var(--sage)] top-[40%] right-[10%] opacity-20"></div>

            <!-- Ornaments Desktop -->
            <div class="absolute top-[-40px] left-[-40px] w-80 opacity-60 pointer-events-none" style="transform: scale(-1,-1);">
                <img src="/assets/corner-pink.png" class="w-full anim-pulse">
            </div>
            <div class="absolute top-[-40px] right-[-40px] w-80 opacity-60 pointer-events-none" style="transform: rotate(-90deg);">
                <img src="/assets/corner-pink.png" class="w-full anim-pulse-delay">
            </div>
            <div class="absolute bottom-[-40px] left-[-40px] w-80 opacity-60 pointer-events-none" style="transform: scaleX(-1);">
                <img src="/assets/corner-pink.png" class="w-full anim-pulse-delay">
            </div>
            <div class="absolute bottom-[-40px] right-[-40px] w-80 opacity-60 pointer-events-none" style="transform: scaleY(-1) rotate(-90deg);">
                <img src="/assets/corner-pink.png" class="w-full anim-pulse">
            </div>

            <div class="text-center relative z-10 flex flex-col items-center p-12 glass-panel">
                <p class="font-sans text-xs tracking-[0.4em] uppercase text-[var(--sage)] mb-4 font-semibold">Summer Romance</p>
                <h1 class="font-script text-8xl md:text-9xl text-[var(--coral)] drop-shadow-sm leading-tight mb-2">
                    {{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}
                </h1>
                <p class="font-serif italic text-xl text-[var(--ink)] mt-4">{{ heroDateText }}</p>
            </div>

            <!-- Scroll indicator -->
            <div class="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-[var(--sage)]">
                <span class="text-[10px] tracking-[0.3em] uppercase font-bold" style="writing-mode: vertical-rl;">Scroll</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-4 h-4 animate-bounce"><path d="M12 5v14M19 12l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
        </div>

        <!-- MAIN APP CONTAINER (Scrollable) -->
        <div id="app-wrap" class="w-full lg:w-[420px] lg:ml-auto min-h-screen relative bg-[var(--cream)] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] overflow-x-hidden">

            <!-- floating particles -->
            <div ref="petalsContainer" class="fixed inset-y-0 right-0 w-full lg:w-[420px] pointer-events-none z-40 hidden md:block overflow-hidden"></div>

            <!-- Background Blobs for Mobile View -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-[var(--coral)]/10 rounded-bl-full z-0 pointer-events-none"></div>
            <div class="absolute top-[20%] left-0 w-48 h-48 bg-[var(--yellow)]/10 rounded-r-full z-0 pointer-events-none"></div>
            <div class="absolute top-[60%] right-0 w-56 h-56 bg-[var(--sage)]/10 rounded-l-full z-0 pointer-events-none"></div>

            <!-- ================= ENVELOPE / COVER ================= -->
            <div v-if="!opened" class="fixed top-0 bottom-0 right-0 w-full lg:w-[420px] z-50 bg-[var(--cream)] overflow-y-auto overflow-x-hidden">
                <div class="relative max-w-md w-full mx-auto min-h-full flex flex-col p-4">
                    <!-- Blobs in envelope -->
                    <div class="blob w-64 h-64 bg-[var(--coral)] top-[-10%] right-[-10%]"></div>
                    <div class="blob w-72 h-72 bg-[var(--yellow)] bottom-[-10%] left-[-10%]"></div>

                    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <div class="corner-wrap corner-tl"><img src="/assets/corner-pink.png" alt=""></div>
                        <div class="corner-wrap corner-br"><img src="/assets/corner-pink.png" alt=""></div>
                    </div>

                    <div class="glass-panel w-full text-center py-10 px-4 my-auto relative z-10 border-2 border-white/50">
                        <p class="font-sans font-semibold tracking-[0.3em] text-[10px] text-[var(--sage)] uppercase mb-6">Pernikahan Dari</p>

                        <div class="photo-frame mb-6">
                            <div class="photo-ring">
                                <img
                                    v-for="(photo, index) in coverPhotos"
                                    :key="photo + index"
                                    :src="photo"
                                    alt="Foto Pasangan"
                                    class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                                    :class="index === activeCoverIndex ? 'opacity-100' : 'opacity-0'"
                                >
                            </div>
                            <img src="/assets/corner2pink.png" alt="" class="corner-bottom">
                        </div>

                        <div v-if="coverPhotos.length > 1" class="flex gap-1.5 mt-2 justify-center relative z-10">
                            <span
                                v-for="(photo, index) in coverPhotos"
                                :key="'dot-' + index"
                                class="h-1.5 w-1.5 rounded-full transition-colors"
                                :class="index === activeCoverIndex ? 'bg-[var(--coral)]' : 'bg-[var(--sage)]/30'"
                            ></span>
                        </div>

                        <h1 class="font-script text-6xl md:text-7xl leading-none mt-2 text-[var(--coral)]">
                            {{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}
                        </h1>
                        <div class="divider-line w-24 mx-auto my-6"></div>
                        
                        <div class="mb-8">
                            <p class="text-[10px] uppercase tracking-widest text-[var(--sage)] mb-2">Kepada Yth.</p>
                            <p class="font-serif text-xl font-bold">{{ guest?.name ?? 'Tamu Undangan' }}</p>
                        </div>

                        <button @click="openInvitation" class="btn-primary font-sans font-semibold tracking-widest text-xs uppercase px-8 py-3 rounded-full shadow-md animate-bounce">
                            Buka Undangan
                        </button>
                    </div>
                </div>
            </div>

            <!-- ================= MAIN CONTENT ================= -->
            <div v-show="opened" class="relative z-10">

                <!-- audio control -->
                <button
                    @click="toggleMusic"
                    class="fixed top-5 right-5 z-50 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    :class="isPlaying ? 'bg-[var(--coral)]' : 'bg-gray-400'"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                </button>

                <!-- bottom icon navbar -->
                <nav id="bottomNav">
                    <a href="#hero" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/></svg>
                        <span>Beranda</span>
                    </a>
                    <a href="#couple" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.4-9.5-9C.8 7.4 3 4 6.5 4 9 4 11 6 12 7.3 13 6 15 4 17.5 4 21 4 23.2 7.4 21.5 11 19 15.6 12 20 12 20Z"/></svg>
                        <span>Pasangan</span>
                    </a>
                    <a href="#events" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="7" width="16" height="13" rx="1.5"/><path d="M4 11h16"/><path d="M8 4v5M16 4v5"/></svg>
                        <span>Acara</span>
                    </a>
                    <a href="#story" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                        <span>Cerita</span>
                    </a>
                    <a href="#gallery" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>
                        <span>Galeri</span>
                    </a>
                    <a href="#gift" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="9" width="16" height="11" rx="1"/><path d="M4 9h16v4H4z"/><path d="M12 9v11"/><path d="M12 9c-1.4 0-2.6-1.4-2.6-2.7C9.4 5 10.4 4 11.5 4c1.4 0 2.5 2.3.5 5Z"/><path d="M12 9c1.4 0 2.6-1.4 2.6-2.7C14.6 5 13.6 4 12.5 4c-1.4 0-2.5 2.3-.5 5Z"/></svg>
                        <span>Kado</span>
                    </a>
                    <a href="#rsvp" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v11H9l-4 3.5V16H4z"/></svg>
                        <span>Ucapan</span>
                    </a>
                </nav>

                <!-- HERO -->
                <section id="hero" class="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
                    <div class="corner-wrap corner-tr"><img src="/assets/corner-pink.png" alt=""></div>
                    <div class="corner-wrap corner-bl"><img src="/assets/corner-pink.png" alt=""></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-16 border-white/50">
                        <p class="font-sans font-semibold tracking-[0.4em] text-[9px] uppercase text-[var(--sage)] mb-6 reveal">Kami Akan Menikah</p>

                        <div class="photo-frame mb-8 reveal">
                            <div class="photo-ring">
                                <img
                                    v-for="(photo, index) in coverPhotos"
                                    :key="photo + index"
                                    :src="photo"
                                    alt="Foto Pasangan"
                                    class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                                    :class="index === activeCoverIndex ? 'opacity-100' : 'opacity-0'"
                                >
                            </div>
                            <img src="/assets/corner2pink.png" alt="" class="corner-bottom">
                        </div>

                        <div v-if="coverPhotos.length > 1" class="reveal flex gap-1.5 mb-6 justify-center relative z-10 -mt-2">
                            <span
                                v-for="(photo, index) in coverPhotos"
                                :key="'dot-' + index"
                                class="h-1.5 w-1.5 rounded-full transition-colors"
                                :class="index === activeCoverIndex ? 'bg-[var(--coral)]' : 'bg-[var(--sage)]/30'"
                            ></span>
                        </div>

                        <h1 class="font-script text-7xl md:text-8xl mb-4 reveal text-[var(--coral)]">
                            {{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}
                        </h1>
                        <p class="font-serif italic text-lg text-[var(--ink)] reveal">{{ heroDateText }}</p>
                        <div class="divider-line w-32 mx-auto my-8 reveal"></div>
                        
                        <p class="font-serif italic text-[var(--ink)] mb-2 reveal">"{{ quoteText }}"</p>
                        <p class="font-sans text-[10px] text-[var(--sage)] tracking-widest uppercase font-semibold reveal">{{ quoteSource }}</p>
                    </div>
                </section>

                <!-- COUPLE -->
                <section id="couple" class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-tl"><img src="/assets/corner-pink.png" alt=""></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-4 py-16 border-white/50">
                        <h3 class="font-script text-5xl text-[var(--yellow)] mb-12 reveal">Pasangan Mempelai</h3>

                        <div class="flex flex-col gap-8 items-center">
                            <!-- Bride -->
                            <div class="reveal">
                                <div class="w-40 h-40 mx-auto mb-4 p-1 rounded-full border-[3px] border-dashed border-[var(--coral)] overflow-hidden bg-white">
                                    <img :src="photoUrl(bride?.photo)" :alt="bride?.full_name" class="w-full h-full object-cover rounded-full">
                                </div>
                                <h4 class="font-serif text-3xl font-bold text-[var(--ink)] mt-4">{{ bride?.full_name }}</h4>
                                <p class="font-sans text-[11px] uppercase tracking-widest mt-2 text-[var(--sage)]">Putri dari Bapak {{ bride?.father_name }} & Ibu {{ bride?.mother_name }}</p>
                            </div>
                            
                            <div class="reveal my-4">
                                <span class="font-script text-5xl text-[var(--coral)]">&amp;</span>
                            </div>

                            <!-- Groom -->
                            <div class="reveal">
                                <div class="w-40 h-40 mx-auto mb-4 p-1 rounded-full border-[3px] border-dashed border-[var(--sage)] overflow-hidden bg-white">
                                    <img :src="photoUrl(groom?.photo)" :alt="groom?.full_name" class="w-full h-full object-cover rounded-full">
                                </div>
                                <h4 class="font-serif text-3xl font-bold text-[var(--ink)] mt-4">{{ groom?.full_name }}</h4>
                                <p class="font-sans text-[11px] uppercase tracking-widest mt-2 text-[var(--sage)]">Putra dari Bapak {{ groom?.father_name }} & Ibu {{ groom?.mother_name }}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- EVENTS -->
                <section id="events" class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-br"><img src="/assets/corner-pink.png" alt=""></div>
                    
                    <div class="w-full max-w-md mx-auto px-2">
                        <h3 class="font-script text-6xl text-center text-[var(--coral)] mb-12 reveal">Simpan Tanggal</h3>
                        
                        <!-- countdown -->
                        <div class="flex justify-center gap-4 mb-14 reveal glass-panel p-6 border-white/50">
                            <div class="text-center w-16">
                                <div class="text-3xl font-serif text-[var(--coral)] font-bold">{{ cdDays }}</div>
                                <div class="text-[9px] tracking-widest uppercase font-semibold text-[var(--sage)]">Hari</div>
                            </div>
                            <div class="text-center w-16">
                                <div class="text-3xl font-serif text-[var(--coral)] font-bold">{{ cdHours }}</div>
                                <div class="text-[9px] tracking-widest uppercase font-semibold text-[var(--sage)]">Jam</div>
                            </div>
                            <div class="text-center w-16">
                                <div class="text-3xl font-serif text-[var(--coral)] font-bold">{{ cdMins }}</div>
                                <div class="text-[9px] tracking-widest uppercase font-semibold text-[var(--sage)]">Menit</div>
                            </div>
                            <div class="text-center w-16">
                                <div class="text-3xl font-serif text-[var(--coral)] font-bold">{{ cdSecs }}</div>
                                <div class="text-[9px] tracking-widest uppercase font-semibold text-[var(--sage)]">Detik</div>
                            </div>
                        </div>

                        <div class="grid gap-8">
                            <div v-if="akad" class="glass-panel p-8 text-center reveal border-white/50 relative overflow-hidden">
                                <div class="absolute top-0 right-0 w-32 h-32 bg-[var(--coral)]/5 rounded-bl-full z-0"></div>
                                <div class="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center mb-4 text-[var(--coral)] shadow-sm relative z-10">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                                </div>
                                <h4 class="font-serif text-3xl font-bold mb-2 relative z-10 text-[var(--ink)]">Akad Nikah</h4>
                                <p class="font-bold text-[var(--yellow)] mb-2 relative z-10 text-lg">{{ formatLongDate(akad.date) }}</p>
                                <p class="text-sm mb-4 font-semibold text-[var(--sage)] relative z-10">{{ formatTime(akad.time) }} WIB - Selesai</p>
                                <p class="text-xs text-[var(--ink)]/70 mb-6 relative z-10 leading-relaxed">{{ akad.address ?? akad.place }}</p>
                                <a v-if="invitation?.maps_link" :href="invitation.maps_link" target="_blank" class="inline-block bg-white text-[var(--sage)] border border-[var(--sage)] px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--sage)] hover:text-white transition-colors relative z-10 shadow-sm">Lihat Lokasi</a>
                            </div>

                            <div v-if="resepsi" class="glass-panel p-8 text-center reveal border-white/50 relative overflow-hidden">
                                <div class="absolute bottom-0 left-0 w-32 h-32 bg-[var(--yellow)]/5 rounded-tr-full z-0"></div>
                                <div class="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center mb-4 text-[var(--yellow)] shadow-sm relative z-10">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"/></svg>
                                </div>
                                <h4 class="font-serif text-3xl font-bold mb-2 relative z-10 text-[var(--ink)]">Resepsi</h4>
                                <p class="font-bold text-[var(--coral)] mb-2 relative z-10 text-lg">{{ formatLongDate(resepsi.date) }}</p>
                                <p class="text-sm mb-4 font-semibold text-[var(--sage)] relative z-10">{{ formatTime(resepsi.time) }} WIB - Selesai</p>
                                <p class="text-xs text-[var(--ink)]/70 mb-6 relative z-10 leading-relaxed">{{ resepsi.address ?? resepsi.place }}</p>
                                <a v-if="invitation?.maps_link" :href="invitation.maps_link" target="_blank" class="inline-block bg-white text-[var(--sage)] border border-[var(--sage)] px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--sage)] hover:text-white transition-colors relative z-10 shadow-sm">Lihat Lokasi</a>
                            </div>
                        </div>

                        <div class="text-center">
                            <a :href="calendarHref" target="_blank" class="btn-primary inline-block mt-12 font-sans font-semibold tracking-widest text-sm uppercase px-8 py-3 rounded-full reveal">Simpan Tanggal</a>
                        </div>
                    </div>
                </section>

                <!-- LOVE STORY -->
                <section id="story" class="relative px-4 py-16 bg-[var(--yellow)]/10 overflow-hidden">
                    <div class="text-center mb-12 reveal">
                        <p class="font-serif italic text-[var(--sage)] tracking-widest mb-2 text-sm">How it started</p>
                        <h2 class="font-script text-6xl text-[var(--coral)]">Our Journey</h2>
                    </div>
                    <div class="max-w-md mx-auto space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--coral)]/30 before:to-transparent">
                        <div v-for="item in invitation.love_stories" :key="item.id" class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active reveal">
                            <div class="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[var(--cream)] text-[var(--coral)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
                            </div>
                            <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border border-ink/5">
                                <div class="font-bold text-[var(--sage)] mb-1">{{ item.title }}</div>
                                <div class="text-ink/70 text-sm">{{ item.description }}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- GALLERY -->
                <section id="gallery" class="relative px-4 py-16 overflow-hidden">
                    <div class="w-full max-w-md mx-auto">
                        <h3 class="font-script text-6xl text-center text-[var(--sage)] mb-12 reveal">Momen Kami</h3>
                        
                        <!-- Carousel Container -->
                        <div class="reveal relative bg-white/40 p-2 rounded-3xl shadow-sm border border-white mb-8">
                            <!-- Main Image -->
                            <div class="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-2">
                                <img :src="mainGalleryImg" alt="Gallery" class="w-full h-full object-cover">
                                
                                <!-- Arrows -->
                                <button @click="prevGallery" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/20 text-white rounded-full backdrop-blur-sm hover:bg-black/40 transition">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-5 h-5"><path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                                <button @click="nextGallery" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/20 text-white rounded-full backdrop-blur-sm hover:bg-black/40 transition">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-5 h-5"><path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                            </div>

                            <!-- Thumbnails -->
                            <div ref="thumbsWrap" class="relative flex gap-2 overflow-x-auto py-1 px-1 snap-x hide-scrollbar">
                                <img 
                                    v-for="(img, idx) in galleryImages"
                                    :key="idx"
                                    :src="img"
                                    @click="setGallery(idx)"
                                    class="w-16 h-16 rounded-xl object-cover cursor-pointer snap-start shrink-0 transition-all"
                                    :class="idx === currentGalIdx ? 'border-2 border-[var(--coral)]' : 'opacity-60 hover:opacity-100'"
                                >
                            </div>
                        </div>
                    </div>
                </section>

                <!-- WEDDING GIFT -->
                <section v-if="invitation?.accounts?.length" id="gift" class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-tl"><img src="/assets/corner-pink.png" alt=""></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-16 border-white/50">
                        <h3 class="font-script text-6xl mb-4 reveal text-[var(--yellow)] drop-shadow-sm">Tanda Kasih</h3>
                        <p class="text-xs text-[var(--ink)]/70 mx-auto mb-10 reveal font-semibold leading-relaxed">Doa restu Anda adalah karunia paling berarti bagi kami. Namun jika ingin memberi tanda kasih, Anda dapat melalui rekening berikut:</p>

                        <div class="grid gap-5 text-left">
                            <div v-for="(account, index) in invitation.accounts" :key="account.id" class="reveal border-2 border-white bg-white/60 rounded-2xl p-6 shadow-sm">
                                <p class="text-[10px] tracking-widest uppercase font-bold mb-2" :class="index % 2 === 0 ? 'text-[var(--coral)]' : 'text-[var(--sage)]'">{{ account.bank_name }}</p>
                                <p class="font-serif text-3xl mb-1 font-bold text-[var(--ink)]">{{ account.account_number }}</p>
                                <p class="text-xs text-[var(--ink)]/60 mb-5 font-semibold">a.n. {{ account.account_holder }}</p>
                                <button @click="copyAccount(account.account_number)" class="text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all" :class="index % 2 === 0 ? 'bg-[var(--coral)] hover:bg-[#E07A5F]' : 'bg-[var(--sage)] hover:bg-[#72928A]'">Salin Nomor</button>
                            </div>
                        </div>
                        
                        <div v-if="invitation?.gift_address" class="reveal mt-6 border-2 border-white bg-white/60 rounded-2xl p-6 text-left shadow-sm">
                            <p class="text-[10px] tracking-widest uppercase font-bold text-[var(--yellow)] mb-2">Kirim Kado Fisik</p>
                            <p class="text-sm font-bold text-[var(--ink)]">{{ invitation.gift_address.receiver_name }}</p>
                            <p class="text-sm text-[var(--ink)]/70 mt-1">{{ invitation.gift_address.address }}</p>
                            <p v-if="invitation.gift_address.phone" class="text-xs text-[var(--ink)]/50 mt-1">{{ invitation.gift_address.phone }}</p>
                        </div>

                        <p class="text-xs font-bold text-[var(--sage)] mt-6 h-4 transition-opacity" :class="copyToast ? 'opacity-100' : 'opacity-0'">{{ copyToast }}</p>
                    </div>
                </section>

                <!-- UCAPAN & RSVP -->
                <section id="rsvp" class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-tr"><img src="/assets/corner-pink.png" alt=""></div>
                    <div class="corner-wrap corner-bl"><img src="/assets/corner-pink.png" alt=""></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-12 border-white/50">
                        <h2 class="font-script text-6xl mb-10 reveal text-[var(--coral)]">Ucapan & Doa</h2>

                        <form @submit.prevent="submitWish" class="text-left space-y-4 reveal bg-white/50 rounded-2xl p-6 shadow-sm border border-white">
                            <div>
                                <input v-model="form.name" required type="text" placeholder="Nama Lengkap" class="w-full border-2 border-white rounded-xl px-4 py-3 bg-white/60 text-sm font-semibold focus:outline-none focus:border-[var(--coral)] focus:bg-white transition-colors placeholder-[var(--sage)]">
                            </div>
                            
                            <div>
                                <div class="flex gap-3">
                                    <label class="flex-1 relative cursor-pointer group">
                                        <input v-model="form.attendance" type="radio" name="attendance" value="hadir" required class="peer sr-only">
                                        <div class="w-full text-center py-3 rounded-xl bg-white border-2 border-white text-[var(--sage)] text-xs font-bold uppercase tracking-wider peer-checked:bg-[var(--sage)] peer-checked:text-white peer-checked:border-[var(--sage)] transition-all shadow-sm">
                                            Hadir
                                        </div>
                                    </label>
                                    <label class="flex-1 relative cursor-pointer group">
                                        <input v-model="form.attendance" type="radio" name="attendance" value="tidak_hadir" class="peer sr-only">
                                        <div class="w-full text-center py-3 rounded-xl bg-white border-2 border-white text-[var(--coral)] text-xs font-bold uppercase tracking-wider peer-checked:bg-[var(--coral)] peer-checked:text-white peer-checked:border-[var(--coral)] transition-all shadow-sm">
                                            Tidak Hadir
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <textarea v-model="form.message" required rows="3" placeholder="Tulis ucapan dan doa..." class="w-full border-2 border-white rounded-xl px-4 py-3 bg-white/60 text-sm font-semibold focus:outline-none focus:border-[var(--coral)] focus:bg-white transition-colors placeholder-[var(--sage)] resize-none"></textarea>
                            </div>

                            <button type="submit" :disabled="form.processing" class="w-full bg-[var(--yellow)] text-white font-bold tracking-widest text-[11px] uppercase px-8 py-4 rounded-xl shadow-md hover:bg-[#E0A96D] disabled:opacity-60 transition-colors mt-2">Kirim Ucapan</button>
                            <p class="text-[10px] text-[var(--sage)] font-bold text-center mt-2 h-4 uppercase tracking-widest">{{ rsvpMsg }}</p>
                        </form>

                        <div class="mt-12 relative">
                            <div class="space-y-4 text-left max-h-[320px] overflow-y-auto pr-2 hide-scrollbar">
                                <div v-if="!wishes.length" class="text-center text-sm text-[var(--ink)]/40 py-6">Jadilah yang pertama mengirim ucapan.</div>

                                <div v-for="wish in pagedWishes" :key="wish.id" class="bg-white/70 p-4 rounded-xl shadow-sm border-2 border-white">
                                    <div class="flex items-center justify-between mb-2">
                                        <h4 class="font-serif font-bold text-[var(--ink)] text-sm">{{ wish.name }}</h4>
                                        <span 
                                            class="px-3 py-1 text-white rounded-full text-[9px] uppercase font-bold tracking-wider"
                                            :class="wish.attendance === 'hadir' ? 'bg-[var(--sage)]' : 'bg-[var(--coral)]'"
                                        >
                                            {{ attendanceLabel(wish.attendance) }}
                                        </span>
                                    </div>
                                    <p class="font-sans text-xs font-medium text-[var(--ink)]/80 leading-relaxed">{{ wish.message }}</p>
                                </div>
                            </div>
                            
                            <div v-if="wishes.length" class="flex items-center justify-center gap-2 mt-6">
                                <button
                                    @click="goToWishesPage(wishesPage - 1)"
                                    :disabled="wishesPage === 1"
                                    class="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--sage)] text-[var(--sage)] transition-all"
                                    :class="wishesPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--sage)] hover:text-white'"
                                >
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                                <button
                                    v-for="p in wishesPageNumbers"
                                    :key="p"
                                    @click="goToWishesPage(p)"
                                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                                    :class="p === wishesPage ? 'bg-[var(--sage)] text-white' : 'border border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)] hover:text-white'"
                                >
                                    {{ p }}
                                </button>
                                <button
                                    @click="goToWishesPage(wishesPage + 1)"
                                    :disabled="wishesPage === totalWishesPages"
                                    class="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--sage)] text-[var(--sage)] transition-all"
                                    :class="wishesPage === totalWishesPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--sage)] hover:text-white'"
                                >
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- CLOSING -->
                <section class="relative px-4 py-16 overflow-hidden">
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-16 border-white/50">
                        <p class="font-sans text-xs tracking-widest uppercase text-[var(--sage)] mb-6 reveal font-bold">Terima Kasih</p>
                        <h2 class="font-script text-7xl reveal text-[var(--ink)]">
                            {{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}
                        </h2>
                    </div>
                </section>

                <footer class="text-center py-8 border-t border-white/50 mt-10">
                    <p class="text-[10px] font-bold tracking-widest uppercase text-[var(--sage)]">© {{ new Date().getFullYear() }} Weeding Theme Builder</p>
                </footer>
            </div>
        </div>
    </div>
</template>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600&family=Great+Vibes&display=swap');

  :root{
    --ink:#4A4036;
    --coral:#F28482;
    --yellow:#F6BD60;
    --cream:#FFF9F2;
    --sage:#84A59D;
    --gold:#E0A96D;
  }
  
  html{scroll-behavior:smooth;}
  
  .font-script{font-family:'Great Vibes', cursive;}
  .font-serif{font-family:'Playfair Display', serif;}

  .corner-wrap{position:absolute; width:220px; pointer-events:none; z-index:0;}
  .corner-wrap img{width:100%; display:block; opacity:0.6; animation:pulseZoom 5.5s ease-in-out infinite;}

  .corner-tl{top:-18px; left:-18px; transform:scale(-1,-1);}
  .corner-tr{top:-18px; right:-18px; transform:rotate(-90deg);}
  .corner-bl{bottom:-18px; left:-18px; transform:scaleX(-1);}
  .corner-br{bottom:-18px; right:-18px; transform:rotate(-90deg);}

  .corner-tl img{animation-delay:0s;}
  .corner-tr img{animation-delay:1.2s;}
  .corner-bl img{animation-delay:0.6s;}
  .corner-br img{animation-delay:1.8s;}

  @keyframes pulseZoom{
    0%,100%{ transform:scale(1); }
    50%{ transform:scale(1.09); }
  }

  .glass-panel {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border-radius: 2rem;
    position: relative;
    z-index: 10;
  }

  .divider-line{height:2px; background:linear-gradient(90deg, transparent, var(--coral), transparent);}

  .reveal{opacity:0; transform:translateY(30px); transition:opacity 0.9s ease, transform 0.9s cubic-bezier(0.5, 0, 0, 1);}
  .reveal.opacity-100{opacity:1; transform:translateY(0);}

  /* Floral Petal Particles */
  .particle{
    position:absolute; top:-10%; opacity:0.85; animation:fall linear infinite; pointer-events:none;
  }
  @keyframes fall{
    0%{transform:translateY(0) rotate(0deg); opacity:0.9;}
    100%{transform:translateY(110vh) rotate(360deg); opacity:0.2;}
  }

  .btn-primary{
    background:var(--coral); color:white; font-family:'Poppins', sans-serif;
    transition:background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  }
  .btn-primary:hover:not(:disabled){background:#E07A5F; transform:translateY(-2px); box-shadow:0 10px 20px rgba(242, 132, 130, 0.3);}

  ::selection{background:var(--yellow); color:var(--ink);}

  /* photo frame */
  .photo-frame{position:relative; width:100%; max-width:240px; height:auto; margin:0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center;}
  .photo-frame .corner-bottom{width:160px; height:auto; object-fit:contain; opacity:0.9; margin-top:-40px; position:relative; z-index:10; animation:cornerZoom 4s ease-in-out infinite;}
  .photo-frame .photo-ring{position:relative; width:200px; height:260px; border-radius:100px 100px 20px 20px; border:4px solid white; box-shadow:0 10px 30px rgba(242,132,130,0.2); overflow:hidden; z-index:2;}
  .photo-frame .photo-ring img{width:100%; height:100%; object-fit:cover; object-position: center;}

  @keyframes cornerZoom{
    0%,100%{ transform:scale(1); }
    50%{ transform:scale(1.1); }
  }

  .anim-pulse { animation: pulseZoom 5.5s ease-in-out infinite; }
  .anim-pulse-delay { animation: pulseZoom 5.5s ease-in-out infinite; animation-delay: 2s; }

  /* bottom navbar */
  #bottomNav{
    position:fixed; left:50%; transform:translateX(-50%); bottom:env(safe-area-inset-bottom, 24px); z-index:50;
    margin-bottom: 24px;
    width:calc(100% - 48px); max-width:360px;
    background:rgba(255, 255, 255, 0.85);
    backdrop-filter:blur(16px);
    -webkit-backdrop-filter:blur(16px);
    border:1px solid rgba(255, 255, 255, 0.5);
    border-radius:9999px;
    box-shadow:0 10px 40px rgba(242,132,130,0.15);
    display:flex; justify-content:space-around; align-items:center;
    padding:12px 8px;
  }
  @media(min-width:1024px){
    #bottomNav{ left:auto; right:30px; transform:none; }
  }
  .nav-icon{display:flex; flex-direction:column; align-items:center; gap:4px; color:var(--sage); transition:all .3s ease; width:44px;}
  .nav-icon svg{width:20px; height:20px;}
  .nav-icon span{font-size:9px; letter-spacing:.05em; text-transform:uppercase; font-weight:600;}
  .nav-icon.active{color:var(--coral); transform:translateY(-3px);}

  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* Blob Backgrounds */
  .blob { position: absolute; filter: blur(40px); z-index: 0; opacity: 0.4; border-radius: 50%; }
</style>
