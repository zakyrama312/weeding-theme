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
        : '/assets/music/gamelan-jawa.mp3'
)

const quoteText = computed(
    () =>
        props.invitation?.quote_text ??
        'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.'
)
const quoteSource = computed(() => props.invitation?.quote_source ?? 'Q.S. Ar-Rum : 21')

const wishes = computed(() => props.invitation?.wishes ?? [])

const initials = (name) =>
    (name ?? '')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()

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
    for(let i=0;i<10;i++){
        const p = document.createElement('div');
        p.className = 'petal';
        p.style.left = Math.random()*100+'%';
        p.style.width = (10+Math.random()*14)+'px';
        p.style.animationDuration = (10+Math.random()*10)+'s';
        p.style.animationDelay = (Math.random()*10)+'s';
        p.innerHTML = `<svg viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2c3 3 3 7 0 10-3-3-3-7 0-10z"/></svg>`;
        container.appendChild(p);
    }
}

const { toast: copyToast, copy: copyAccountRaw } = useCopyToClipboard()
const copyAccount = (number) => copyAccountRaw(number, 'Nomor rekening disalin: ' + number)

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

    <div class="antialiased font-['Jost',sans-serif] bg-[var(--cream)] text-[var(--ink)] overflow-x-hidden pb-[100px] wayang-bg">

        <!-- Parallax Clouds Background -->
        <div class="cloud-container">
            <div class="cloud cloud-1"></div>
            <div class="cloud cloud-2"></div>
            <div class="cloud cloud-3"></div>
            <div class="cloud cloud-4"></div>
        </div>

        <!-- DESKTOP LEFT SIDE (Fixed) -->
        <div class="hidden lg:flex fixed inset-y-0 left-0 right-[420px] flex-col items-center justify-center bg-transparent overflow-hidden border-r border-[var(--blue-soft)]/30">
            <!-- Ornaments Desktop -->
            <div class="absolute top-[-40px] left-[-40px] w-96 opacity-80 pointer-events-none" style="transform: scale(-1,-1);">
                <img src="/assets/ornaments/wayang/15.png" class="w-full anim-pulse">
            </div>
            <div class="absolute top-[-40px] right-[-40px] w-96 opacity-80 pointer-events-none" style="transform: rotate(-90deg);">
                <img src="/assets/ornaments/wayang/15.png" class="w-full anim-pulse-delay">
            </div>
            <div class="absolute bottom-[-40px] left-[-40px] w-96 opacity-80 pointer-events-none" style="transform: scaleX(-1);">
                <img src="/assets/ornaments/wayang/15.png" class="w-full anim-pulse-delay">
            </div>
            <div class="absolute bottom-[-40px] right-[-40px] w-96 opacity-80 pointer-events-none" style="transform: scaleY(-1) rotate(-90deg);">
                <img src="/assets/ornaments/wayang/15.png" class="w-full anim-pulse">
            </div>

            <!-- Background subtle texture -->
            <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(var(--ink) 1px, transparent 1px); background-size: 24px 24px;"></div>

            <div class="text-center relative z-10 flex flex-col items-center">
                <p class="font-serif tracking-[0.35em] text-sm uppercase text-[var(--ink)] mb-4">The Wedding Of</p>
                <h1 class="font-script text-8xl text-[var(--ink)] drop-shadow-sm">
                    {{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}
                </h1>
            </div>

            <!-- Scroll indicator -->
            <div class="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-[var(--ink)]/40">
                <span class="text-[10px] tracking-[0.3em] uppercase" style="writing-mode: vertical-rl;">Scroll</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-4 h-4 animate-bounce"><path d="M12 5v14M19 12l-7 7-7-7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
        </div>

        <!-- MAIN APP CONTAINER (Scrollable) -->
        <div id="app-wrap" class="w-full lg:w-[420px] lg:ml-auto min-h-screen relative bg-transparent shadow-[-10px_0_30px_rgba(0,0,0,0.1)]">

            <!-- floating petals -->
            <div ref="petalsContainer" class="fixed inset-y-0 right-0 w-full lg:w-[420px] pointer-events-none z-40 hidden md:block overflow-hidden"></div>

            <!-- ================= ENVELOPE / COVER ================= -->
            <div v-if="!opened" class="fixed top-0 bottom-0 right-0 w-full lg:w-[420px] z-50 bg-transparent overflow-y-auto overflow-x-hidden wayang-bg">
                <div class="relative max-w-md w-full mx-auto min-h-full flex flex-col p-4">
                    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <div class="corner-wrap corner-tl"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                        <div class="corner-wrap corner-br"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    </div>

                    <div class="glass-panel w-full text-center py-10 px-4 my-auto relative z-10">
                        <p class="font-serif tracking-[0.35em] text-[10px] text-[var(--blue)] uppercase mb-4">The Wedding Of</p>

                        <div class="photo-frame">
                            <div class="photo-ring">
                                <img
                                    v-for="(photo, index) in coverPhotos"
                                    :key="photo + index"
                                    :src="photo"
                                    alt="Foto Pasangan"
                                    class="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out"
                                    :class="index === activeCoverIndex ? 'opacity-100' : 'opacity-0'"
                                >
                            </div>
                        </div>
                        
                        <div v-if="coverPhotos.length > 1" class="flex gap-1.5 mt-4 justify-center">
                            <span
                                v-for="(photo, index) in coverPhotos"
                                :key="'dot-' + index"
                                class="h-1.5 w-1.5 rounded-full transition-colors"
                                :class="index === activeCoverIndex ? 'bg-[var(--ink)]' : 'bg-[var(--blue-soft)]'"
                            ></span>
                        </div>

                        <h1 class="font-script text-6xl leading-none mt-4" style="color:var(--ink)">
                            {{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}
                        </h1>
                        <div class="divider-line w-20 mx-auto my-3"></div>
                        <p class="font-serif text-xs text-[var(--ink)]/70 mb-1">Kepada Yth. Bapak/Ibu/Saudara/i</p>
                        <p class="font-serif text-lg italic mb-1">{{ guest?.name ?? 'Tamu Undangan' }}</p>
                        <p class="text-[10px] text-[var(--ink)]/50 mb-6">*Mohon maaf apabila ada kesalahan penulisan</p>

                        <button @click="openInvitation" class="btn-primary font-serif tracking-widest text-xs uppercase px-8 py-2.5 rounded-full shadow-md">
                            Buka Undangan
                        </button>
                    </div>
                </div>
            </div>

            <!-- ================= MAIN CONTENT ================= -->
            <div v-show="opened">

                <!-- audio control -->
                <button
                    @click="toggleMusic"
                    class="fixed top-5 right-5 z-50 w-11 h-11 rounded-full bg-[var(--ink)] text-[var(--cream)] flex items-center justify-center shadow-lg"
                    :class="{ 'opacity-40': !isPlaying }"
                >
                    <span>&#9835;</span>
                </button>

                <!-- bottom icon navbar -->
                <nav id="bottomNav">
                    <a href="#hero" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/></svg>
                        <span>Home</span>
                    </a>
                    <a href="#mempelai" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.4-9.5-9C.8 7.4 3 4 6.5 4 9 4 11 6 12 7.3 13 6 15 4 17.5 4 21 4 23.2 7.4 21.5 11 19 15.6 12 20 12 20Z"/></svg>
                        <span>Pasangan</span>
                    </a>
                    <a href="#acara" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="7" width="16" height="13" rx="1.5"/><path d="M4 11h16"/><path d="M8 4v5M16 4v5"/></svg>
                        <span>Acara</span>
                    </a>
                    <a href="#lovestory" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                        <span>Cerita</span>
                    </a>
                    <a href="#galeri" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>
                        <span>Galeri</span>
                    </a>
                    <a href="#kado" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="9" width="16" height="11" rx="1"/><path d="M4 9h16v4H4z"/><path d="M12 9v11"/><path d="M12 9c-1.4 0-2.6-1.4-2.6-2.7C9.4 5 10.4 4 11.5 4c1.4 0 2.5 2.3.5 5Z"/><path d="M12 9c1.4 0 2.6-1.4 2.6-2.7C14.6 5 13.6 4 12.5 4c-1.4 0-2.5 2.3-.5 5Z"/></svg>
                        <span>Kado</span>
                    </a>
                    <a href="#ucapan" class="nav-icon" data-nav>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5h16v11H9l-4 3.5V16H4z"/></svg>
                        <span>Ucapan</span>
                    </a>
                </nav>

                <!-- HERO -->
                <section id="hero" class="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
                    <div class="corner-wrap corner-tr"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    <div class="corner-wrap corner-bl"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-16">
                        <p class="reveal font-serif tracking-[0.4em] text-xs uppercase text-[var(--blue)] mb-6">The Wedding Of</p>

                        <div class="reveal photo-frame mb-2">
                            <div class="photo-ring">
                                <img
                                    v-for="(photo, index) in coverPhotos"
                                    :key="photo + index"
                                    :src="photo"
                                    alt="Foto Pasangan"
                                    class="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out"
                                    :class="index === activeCoverIndex ? 'opacity-100' : 'opacity-0'"
                                >
                            </div>
                        </div>
                        
                        <div v-if="coverPhotos.length > 1" class="reveal flex gap-1.5 mt-4 justify-center relative z-10">
                            <span
                                v-for="(photo, index) in coverPhotos"
                                :key="'dot-' + index"
                                class="h-1.5 w-1.5 rounded-full transition-colors"
                                :class="index === activeCoverIndex ? 'bg-[var(--ink)]' : 'bg-[var(--blue-soft)]'"
                            ></span>
                        </div>

                        <h1 class="reveal font-script text-7xl md:text-8xl mt-4 mb-2" style="color:var(--ink)">
                            {{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}
                        </h1>
                        <p class="reveal font-serif text-lg text-[var(--ink)]/80">{{ heroDateText }}</p>
                        <img src="/assets/ornaments/wayang/14.png" alt="" class="w-48 mx-auto my-8 reveal opacity-80">
                        <p class="reveal font-serif text-sm text-[var(--ink)]/60">Dengan penuh syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir merayakan hari bahagia kami</p>
                    </div>
                </section>

                <!-- QUOTE -->
                <section class="relative px-4 py-12 overflow-hidden">
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-12">
                        <p class="reveal font-serif italic text-lg md:text-2xl mx-auto leading-relaxed">
                            "{{ quoteText }}"
                        </p>
                        <p class="reveal font-serif text-sm text-[var(--blue)] mt-6">{{ quoteSource }}</p>
                    </div>
                </section>

                <!-- MEMPELAI -->
                <section id="mempelai" class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-tr"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    <div class="corner-wrap corner-bl"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-4 py-12">
                        <p class="reveal font-serif text-lg text-[var(--ink)] font-semibold mb-4">Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
                        <p class="reveal font-serif text-sm text-[var(--ink)]/80 mx-auto mb-10">Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Semoga ridho-Nya senantiasa mengiringi pernikahan kami.</p>

                        <div class="flex flex-col gap-6 items-center">
                            <div class="reveal">
                                <div class="w-44 h-56 mx-auto rounded-t-full rounded-b-xl border-[3px] border-white shadow-sm flex items-center justify-center overflow-hidden relative">
                                    <img :src="photoUrl(bride?.photo)" :alt="bride?.full_name" class="w-full h-full object-cover object-top">
                                </div>
                                <h3 class="font-script text-5xl mt-5 mb-1" style="color:var(--ink)">{{ bride?.full_name }}</h3>
                                <p class="font-serif text-sm font-semibold text-[var(--ink)] mb-0.5">Putri dari</p>
                                <p class="font-serif text-[13px] text-[var(--ink)]/80">{{ bride?.father_name }} &amp; {{ bride?.mother_name }}</p>
                            </div>
                            
                            <div class="reveal my-2">
                                <span class="font-script text-5xl text-[var(--gold)]">&amp;</span>
                            </div>

                            <div class="reveal">
                                <div class="w-44 h-56 mx-auto rounded-t-full rounded-b-xl border-[3px] border-white shadow-sm flex items-center justify-center overflow-hidden">
                                    <img :src="photoUrl(groom?.photo)" :alt="groom?.full_name" class="w-full h-full object-cover object-top">
                                </div>
                                <h3 class="font-script text-5xl mt-5 mb-1" style="color:var(--ink)">{{ groom?.full_name }}</h3>
                                <p class="font-serif text-sm font-semibold text-[var(--ink)] mb-0.5">Putra dari</p>
                                <p class="font-serif text-[13px] text-[var(--ink)]/80">{{ groom?.father_name }} &amp; {{ groom?.mother_name }}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ACARA -->
                <section id="acara" class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-tl"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    <div class="corner-wrap corner-br"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-16">
                        <p class="reveal font-serif tracking-[0.35em] text-xs uppercase text-[var(--blue)] mb-8">Save The Date</p>

                        <!-- countdown -->
                        <div class="reveal flex justify-center gap-4 mb-14">
                            <div class="text-center">
                                <div class="text-3xl font-serif">{{ cdDays }}</div>
                                <div class="text-[10px] tracking-widest uppercase text-[var(--ink)]/50">Hari</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-serif">{{ cdHours }}</div>
                                <div class="text-[10px] tracking-widest uppercase text-[var(--ink)]/50">Jam</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-serif">{{ cdMins }}</div>
                                <div class="text-[10px] tracking-widest uppercase text-[var(--ink)]/50">Menit</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-serif">{{ cdSecs }}</div>
                                <div class="text-[10px] tracking-widest uppercase text-[var(--ink)]/50">Detik</div>
                            </div>
                        </div>

                        <div class="grid gap-8">
                            <div v-if="akad" class="reveal border border-[var(--blue-soft)]/50 rounded-xl p-8 bg-white/30 shadow-sm relative overflow-hidden">
                                <h3 class="font-serif text-2xl mb-1 relative z-10">Akad Nikah</h3>
                                <p class="font-script text-4xl my-2 text-[var(--blue)] relative z-10">{{ formatLongDate(akad.date) }}</p>
                                <p class="text-sm text-[var(--ink)]/70 mb-4 relative z-10">{{ formatTime(akad.time) }} WIB &ndash; Selesai</p>
                                <p class="text-sm text-[var(--ink)]/60 mb-4 relative z-10">{{ akad.address ?? akad.place }}</p>
                                <a v-if="invitation?.maps_link" :href="invitation.maps_link" target="_blank" class="inline-block text-xs tracking-widest uppercase border-b border-[var(--ink)] pb-1 relative z-10">Google Maps</a>
                            </div>
                            <div v-if="resepsi" class="reveal border border-[var(--blue-soft)]/50 rounded-xl p-8 bg-white/30 shadow-sm relative overflow-hidden">
                                <h3 class="font-serif text-2xl mb-1 relative z-10">Resepsi</h3>
                                <p class="font-script text-4xl my-2 text-[var(--blue)] relative z-10">{{ formatLongDate(resepsi.date) }}</p>
                                <p class="text-sm text-[var(--ink)]/70 mb-4 relative z-10">{{ formatTime(resepsi.time) }} WIB</p>
                                <p class="text-sm text-[var(--ink)]/60 mb-4 relative z-10">{{ resepsi.address ?? resepsi.place }}</p>
                                <a v-if="invitation?.maps_link" :href="invitation.maps_link" target="_blank" class="inline-block text-xs tracking-widest uppercase border-b border-[var(--ink)] pb-1 relative z-10">Google Maps</a>
                            </div>
                        </div>

                        <a :href="calendarHref" target="_blank" class="btn-primary inline-block mt-12 font-serif tracking-widest text-sm uppercase px-8 py-3 rounded-full reveal">Simpan Tanggal</a>
                    </div>
                </section>

                <!-- LOVE STORY -->
                <section id="lovestory" class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-tr"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-16">
                        <p class="reveal font-serif tracking-[0.35em] text-xs uppercase text-[var(--blue)] mb-2">Our Journey</p>
                        <h2 class="reveal font-script text-5xl mb-14">Love Story</h2>

                        <div class="text-left space-y-10">
                            <div v-for="item in invitation.love_stories" :key="item.id" class="reveal flex gap-5">
                                <div class="w-2 h-2 rounded-full bg-[var(--gold)] mt-2 shrink-0"></div>
                                <div>
                                    <h4 class="font-serif text-xl mb-1">{{ item.title }}</h4>
                                    <p class="text-sm text-[var(--ink)]/60">{{ item.description }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- GALERI -->
                <section id="galeri" class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-tl"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    <div class="corner-wrap corner-br"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center p-4">
                        <p class="reveal font-serif tracking-[0.35em] text-xs uppercase text-[var(--blue)] mb-2 mt-8">Gallery</p>
                        <h2 class="reveal font-script text-5xl mb-8">Our Moments</h2>
                        
                        <!-- Carousel Container -->
                        <div class="reveal relative bg-white/40 p-2 rounded-2xl shadow-sm border border-white/50 mb-8">
                            <!-- Main Image -->
                            <div class="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-2">
                                <img :src="mainGalleryImg" alt="Gallery" class="w-full h-full object-cover object-top">
                                
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
                                    class="w-16 h-16 rounded-lg object-cover cursor-pointer snap-start shrink-0 transition-all"
                                    :class="idx === currentGalIdx ? 'border-2 border-[var(--gold)]' : 'opacity-60 hover:opacity-100'"
                                >
                            </div>
                        </div>
                    </div>
                </section>

                <!-- WEDDING GIFT -->
                <section v-if="invitation?.accounts?.length" id="kado" class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-tr"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-16">
                        <p class="reveal font-serif tracking-[0.35em] text-xs uppercase text-[var(--blue)] mb-2">Wedding Gift</p>
                        <h2 class="reveal font-script text-5xl mb-4">Tanda Kasih</h2>
                        <p class="reveal text-sm text-[var(--ink)]/60 mx-auto mb-12">Doa restu Anda adalah karunia paling berarti bagi kami. Namun jika ingin memberi tanda kasih, Anda dapat melalui rekening berikut.</p>

                        <div class="grid gap-6 text-left">
                            <div v-for="account in invitation.accounts" :key="account.id" class="reveal border border-[var(--blue-soft)]/50 bg-white/30 rounded-xl p-6 shadow-sm">
                                <p class="text-xs tracking-widest uppercase text-[var(--blue)] mb-2">{{ account.bank_name }}</p>
                                <p class="font-serif text-2xl mb-1">{{ account.account_number }}</p>
                                <p class="text-sm text-[var(--ink)]/60 mb-4">a.n. {{ account.account_holder }}</p>
                                <button @click="copyAccount(account.account_number)" class="text-xs tracking-widest uppercase border-b border-[var(--ink)] pb-1 hover:text-[var(--blue)] transition-colors">Salin Nomor</button>
                            </div>
                        </div>
                        
                        <div v-if="invitation?.gift_address" class="reveal mt-6 border border-[var(--blue-soft)]/50 bg-white/30 rounded-xl p-6 text-left shadow-sm">
                            <p class="text-xs tracking-widest uppercase text-[var(--blue)] mb-2">Kirim Kado Fisik</p>
                            <p class="text-sm font-semibold text-[var(--ink)]">{{ invitation.gift_address.receiver_name }}</p>
                            <p class="text-sm text-[var(--ink)]/70 mt-1">{{ invitation.gift_address.address }}</p>
                            <p v-if="invitation.gift_address.phone" class="text-xs text-[var(--ink)]/50 mt-1">{{ invitation.gift_address.phone }}</p>
                        </div>

                        <p class="text-xs text-[var(--sage)] mt-4 h-4">{{ copyToast }}</p>
                    </div>
                </section>

                <!-- UCAPAN & RSVP -->
                <section id="ucapan" class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-tl"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    <div class="corner-wrap corner-br"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-16">
                        <p class="reveal font-serif tracking-[0.35em] text-xs uppercase text-[var(--blue)] mb-2">RSVP</p>
                        <h2 class="reveal font-script text-5xl mb-10">Ucapan &amp; Doa</h2>

                        <form @submit.prevent="submitWish" class="reveal text-left space-y-4 border border-[var(--blue-soft)] rounded-2xl p-6 bg-white/30 shadow-sm">
                            <div>
                                <input v-model="form.name" required type="text" placeholder="Nama" class="w-full border border-[var(--blue-soft)] rounded-lg px-4 py-3 bg-white/70 text-sm focus:outline-none focus:border-[var(--blue)] placeholder-[var(--ink)]/40 transition-colors">
                            </div>
                            <div>
                                <textarea v-model="form.message" required rows="3" placeholder="Ucapan" class="w-full border border-[var(--blue-soft)] rounded-lg px-4 py-3 bg-white/70 text-sm focus:outline-none focus:border-[var(--blue)] placeholder-[var(--ink)]/40 transition-colors"></textarea>
                            </div>
                            
                            <div class="pt-2 pb-2">
                                <div class="flex items-center gap-4 mb-4">
                                    <hr class="flex-grow border-[var(--blue-soft)]">
                                    <span class="text-xs font-serif font-bold text-[var(--ink)]">Konfirmasi Kehadiran</span>
                                    <hr class="flex-grow border-[var(--blue-soft)]">
                                </div>
                                
                                <div class="flex gap-3">
                                    <label class="flex-1 relative">
                                        <input v-model="form.attendance" type="radio" name="attendance" value="hadir" required class="peer sr-only">
                                        <div class="w-full text-center py-2.5 rounded-full bg-black/5 text-[var(--ink)]/50 text-sm font-semibold cursor-pointer peer-checked:bg-[var(--blue-soft)] peer-checked:text-[var(--ink)] transition-all flex items-center justify-center gap-1.5 border border-transparent peer-checked:border-[var(--blue)]">
                                            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                            Hadir
                                        </div>
                                    </label>
                                    <label class="flex-1 relative">
                                        <input v-model="form.attendance" type="radio" name="attendance" value="tidak_hadir" class="peer sr-only">
                                        <div class="w-full text-center py-2.5 rounded-full bg-black/5 text-[var(--ink)]/50 text-sm font-semibold cursor-pointer peer-checked:bg-gray-300 peer-checked:text-gray-700 transition-all flex items-center justify-center gap-1.5 border border-transparent peer-checked:border-gray-400">
                                            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                                            Tidak Hadir
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" :disabled="form.processing" class="btn-primary w-full font-serif tracking-widest text-sm uppercase px-8 py-3 rounded-full shadow-sm disabled:opacity-60">Kirim</button>
                            <p class="text-xs text-[var(--blue)] font-semibold text-center h-4">{{ rsvpMsg }}</p>
                        </form>

                        <div class="mt-14 relative">
                            <div class="space-y-4 text-left max-h-[360px] overflow-y-auto pr-2 hide-scrollbar">
                                <div v-if="!wishes.length" class="text-center text-sm text-[var(--ink)]/40 py-6">Jadilah yang pertama mengirim ucapan.</div>

                                <div v-for="wish in pagedWishes" :key="wish.id" class="bg-white/80 p-4 rounded-xl shadow-sm border border-white flex gap-4">
                                    <div 
                                        class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                                        :class="wish.attendance === 'hadir' ? 'bg-[var(--blue-soft)] text-[var(--ink)]' : 'bg-gray-200 text-gray-500'"
                                    >
                                        {{ initials(wish.name) }}
                                    </div>
                                    <div class="flex-1">
                                        <p class="font-bold text-[13px] text-[var(--ink)] mb-0.5 flex items-center justify-between">
                                            <span>{{ wish.name }}</span>
                                            <span 
                                                class="text-[9px] px-2 py-0.5 rounded-full font-normal ml-2"
                                                :class="wish.attendance === 'hadir' ? 'bg-[var(--blue-soft)] text-[var(--ink)]' : 'bg-gray-200 text-gray-600'"
                                            >
                                                {{ attendanceLabel(wish.attendance) }}
                                            </span>
                                        </p>
                                        <p class="text-[13px] text-[var(--ink)]/80 leading-relaxed">{{ wish.message }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div v-if="wishes.length" class="flex items-center justify-center gap-2 mt-6">
                                <button
                                    @click="goToWishesPage(wishesPage - 1)"
                                    :disabled="wishesPage === 1"
                                    class="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--blue-soft)] text-[var(--ink)] transition-all"
                                    :class="wishesPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--blue-soft)]/20'"
                                >
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                                <button
                                    v-for="p in wishesPageNumbers"
                                    :key="p"
                                    @click="goToWishesPage(p)"
                                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                                    :class="p === wishesPage ? 'bg-[var(--ink)] text-white' : 'border border-[var(--blue-soft)] text-[var(--ink)] hover:bg-[var(--blue-soft)]/20'"
                                >
                                    {{ p }}
                                </button>
                                <button
                                    @click="goToWishesPage(wishesPage + 1)"
                                    :disabled="wishesPage === totalWishesPages"
                                    class="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--blue-soft)] text-[var(--ink)] transition-all"
                                    :class="wishesPage === totalWishesPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--blue-soft)]/20'"
                                >
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- CLOSING -->
                <section class="relative px-4 py-16 overflow-hidden">
                    <div class="corner-wrap corner-tl"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    <div class="corner-wrap corner-tr"><img src="/assets/ornaments/wayang/15.png" alt="" class="corner-img"></div>
                    
                    <div class="glass-panel w-full max-w-md mx-auto text-center px-6 py-16">
                        <p class="reveal font-serif text-lg mx-auto text-[var(--ink)]/70">Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p>
                        <p class="reveal font-serif text-lg text-[var(--ink)] font-semibold mt-6 mb-10">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>
                        <p class="reveal text-xs tracking-widest uppercase text-[var(--blue)] mb-2">Kami Yang Berbahagia</p>
                        <h2 class="reveal font-script text-6xl">
                            {{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}
                        </h2>
                    </div>
                </section>

                <footer class="text-center py-8 border-t border-[var(--blue-soft)]">
                    <p class="text-[11px] tracking-widest uppercase text-[var(--ink)]/40">Made with love &middot; {{ new Date().getFullYear() }}</p>
                </footer>
            </div>
        </div>
    </div>
</template>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&family=Tangerine:wght@400;700&display=swap');

  :root{
    --ink: #4E342E;
    --blue: #8D6E63;
    --blue-soft: #D7CCC8;
    --cream: #F5F5DC;
    --gold: #C7A662;
    --sage: #8CA089;
  }
  
  html{scroll-behavior:smooth;}
  
  .wayang-bg {
    background-color: var(--cream);
    background-image: url('/assets/ornaments/wayang/texture.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-blend-mode: multiply;
  }
  
  .font-script{font-family:'Tangerine', cursive;}
  .font-serif{font-family:'Cormorant Garamond', serif;}

  .corner-wrap{position:absolute; width:250px; pointer-events:none; z-index:0;}
  .corner-wrap img{width:100%; display:block; opacity:0.75; animation:pulseZoom 5.5s ease-in-out infinite; filter:brightness(1.05);}

  .corner-tl{top:-18px; left:-18px; transform:scale(-1,-1);}
  .corner-tr{top:-18px; right:-18px; transform:rotate(-90deg);}
  .corner-bl{bottom:-18px; left:-18px; transform:scaleX(-1);}
  .corner-br{bottom:-18px; right:-18px; transform:rotate(-90deg) scale(-1, 1);}

  .corner-tl img{animation-delay:0s;}
  .corner-tr img{animation-delay:1.2s;}
  .corner-bl img{animation-delay:0.6s;}
  .corner-br img{animation-delay:1.8s;}

  @keyframes pulseZoom{
    0%,100%{ transform:scale(1); }
    50%{ transform:scale(1.09); }
  }

  .glass-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
    border-radius: 1.5rem;
    position: relative;
    z-index: 10;
  }

  .divider-line{height:1px; background:linear-gradient(90deg, transparent, var(--gold), transparent);}

  .reveal{opacity:0; transform:translateY(24px); transition:opacity 0.9s ease, transform 0.9s ease;}
  .reveal.opacity-100{opacity:1; transform:translateY(0);}

  .petal{position:absolute; top:-10%; opacity:0.85; animation:fall linear infinite; pointer-events:none;}
  @keyframes fall{
    0%{transform:translateY(0) rotate(0deg); opacity:0.9;}
    100%{transform:translateY(110vh) rotate(360deg); opacity:0.2;}
  }

  .btn-primary{
    background:var(--ink); color:var(--cream);
    transition:background 0.3s ease, transform 0.2s ease;
  }
  .btn-primary:hover:not(:disabled){background:var(--blue); transform:translateY(-2px);}

  ::selection{background:var(--blue-soft); color:var(--ink);}

  .photo-frame{position:relative; width:100%; max-width:260px; height:auto; margin:0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center;}
  .photo-frame .photo-ring{position:relative; width:240px; height:240px; border-radius:50%; border:3px solid #fff; box-shadow:0 8px 24px rgba(31,58,95,0.18), 0 0 0 1px var(--blue-soft); overflow:hidden; background:var(--blue-soft)/40; z-index:2;}
  
  .anim-pulse { animation: pulseZoom 5.5s ease-in-out infinite; }
  .anim-pulse-delay { animation: pulseZoom 5.5s ease-in-out infinite; animation-delay: 2s; }

  #bottomNav{
    position:fixed; left:50%; transform:translateX(-50%); bottom:env(safe-area-inset-bottom, 24px); z-index:50;
    margin-bottom: 24px;
    width:calc(100% - 48px); max-width:360px;
    background:rgba(255,255,255,0.75);
    backdrop-filter:blur(16px);
    -webkit-backdrop-filter:blur(16px);
    border:1px solid rgba(255, 255, 255, 0.5);
    border-radius:9999px;
    box-shadow:0 12px 40px rgba(31,58,95,0.15);
    display:flex; justify-content:space-around; align-items:center;
    padding:12px 8px;
  }
  @media(min-width:1024px){
    #bottomNav{ left:auto; right:30px; transform:none; }
  }
  .nav-icon{display:flex; flex-direction:column; align-items:center; gap:4px; color:rgba(31,58,95,0.45); transition:all .3s ease; width:44px;}
  .nav-icon svg{width:20px; height:20px;}
  .nav-icon span{font-size:9px; letter-spacing:.05em; text-transform:uppercase; font-weight:500;}
  
  .nav-icon.active{color:var(--ink); transform:translateY(-3px);}

  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  
  input:focus, select:focus, textarea:focus{outline:none; border-color:var(--blue);}

  /* Parallax Floating Clouds */
  .cloud-container {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none; z-index: 1; overflow: hidden;
  }
  .cloud {
    position: absolute;
    background-image: url('/assets/ornaments/wayang/awan.png');
    background-size: contain; background-repeat: no-repeat;
    opacity: 0.6;
  }
  .cloud-1 {
    width: 350px; height: 180px; top: 5%; left: -350px;
    animation: floatCloud 50s linear infinite;
  }
  .cloud-2 {
    width: 250px; height: 130px; top: 35%; left: -250px;
    animation: floatCloud 40s linear infinite; animation-delay: -15s; opacity: 0.4;
  }
  .cloud-3 {
    width: 450px; height: 230px; bottom: 15%; left: -450px;
    animation: floatCloud 65s linear infinite; animation-delay: -35s; opacity: 0.5;
  }
  .cloud-4 {
    width: 280px; height: 140px; bottom: -20px; left: -280px;
    animation: floatCloud 45s linear infinite; animation-delay: -8s; opacity: 0.45;
  }
  @keyframes floatCloud {
    from { transform: translateX(0) translateY(0); }
    to { transform: translateX(150vw) translateY(-20px); }
  }
  @media(min-width: 1024px) {
    .cloud-1 { width: 700px; height: 360px; left: -700px; }
    .cloud-2 { width: 500px; height: 260px; left: -500px; }
    .cloud-3 { width: 900px; height: 460px; left: -900px; }
    .cloud-4 { width: 600px; height: 300px; left: -600px; }
  }
</style>
