<script setup>
import { useFormatters } from '@/Composables/useFormatters'
import { Head } from '@inertiajs/vue3'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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

const attendanceLabel = (value) => (value === 'hadir' ? 'Hadir' : 'Maaf')

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

const openInvitationAndScroll = () => {
    openInvitation();
    setTimeout(() => {
        window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
    }, 300);
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

useRevealOnScroll({
    selector: '.drop-in',
    activeClass: 'active',
})

const handleMouseMove = (e) => {
    document.querySelectorAll('.premium-polaroid:hover').forEach(el => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -15; 
        const rotateY = ((x - centerX) / centerX) * 15;
        
        el.style.transform = `translateY(-10px) scale(1.02) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
}
const handleMouseOut = (e) => {
    document.querySelectorAll('.premium-polaroid').forEach(el => {
        el.style.transform = ''; 
    });
}

onMounted(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseout', handleMouseOut);
    
    // Fallback manual intersection observer for .stamp-in elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stamp-in').forEach(el => observer.observe(el));
})

onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseout', handleMouseOut);
})

useScrollSpy({
    activeClasses: ['active'],
    inactiveClasses: [],
})
</script>

<template>
    <Head :title="invitation?.name ?? 'Undangan Pernikahan'" />

    <audio v-if="invitation" ref="audioEl" :src="musicSrc" loop></audio>

    <div class="antialiased bg-[var(--board)] text-ink overflow-x-hidden min-h-[100svh]">

        <!-- Desktop Left Side (Fixed) -->
        <div class="hidden lg:flex fixed inset-y-0 left-0 right-[420px] flex-col items-center justify-center bg-[var(--board)] overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] border-r border-[var(--ink)]">
            <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 20px 20px;"></div>
            
            <div class="premium-polaroid transform -rotate-3 hover:rotate-0 w-80 mb-8 cursor-default z-10 transition-all duration-700">
                <div class="masking-tape top-[-15px] left-1/2 -translate-x-1/2 rotate-[-2deg]"></div>
                <div class="relative overflow-hidden w-full aspect-[4/5]">
                    <img
                        v-for="(photo, index) in coverPhotos"
                        :key="photo + index"
                        :src="photo"
                        class="absolute inset-0 w-full h-full object-cover object-top photo-filter transition-opacity duration-1000 ease-in-out"
                        :class="index === activeCoverIndex ? 'opacity-100' : 'opacity-0'"
                    >
                </div>
                
                <div v-if="coverPhotos.length > 1" class="flex gap-1.5 mt-4 mb-2 justify-center">
                    <span
                        v-for="(photo, index) in coverPhotos"
                        :key="'dot-' + index"
                        class="h-1.5 w-1.5 rounded-full transition-colors"
                        :class="index === activeCoverIndex ? 'bg-[var(--ink)]' : 'bg-[var(--ink)]/30'"
                    ></span>
                </div>

                <div class="absolute bottom-4 left-0 w-full text-center">
                    <p class="font-hand text-4xl font-bold text-[var(--ink)]">{{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}</p>
                </div>
            </div>
            
            <div class="text-center z-10 stamp-in active">
                <p class="font-serif italic text-white/50 mb-2 tracking-widest text-sm uppercase">Wedding Invitation</p>
                <h1 class="font-hand text-6xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">A Beautiful Journey</h1>
            </div>
        </div>

        <!-- MAIN APP CONTAINER (Scrollable) -->
        <div id="app-wrap" class="w-full lg:w-[420px] lg:ml-auto min-h-[100svh] relative bg-[var(--board)] overflow-x-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">

            <!-- Hero / Hanging Polaroid (Cover) -->
            <section class="min-h-[100svh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                
                <!-- Hanging String -->
                <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-32 bg-white/30 z-0"></div>

                <div class="premium-polaroid z-10 max-w-sm w-full mt-20 cursor-pointer" :class="opened ? 'scale-90 opacity-50' : 'swinging'" @click="!opened && openInvitationAndScroll()">
                    <div class="masking-tape top-[-15px] left-1/2 -translate-x-1/2 rotate-[-2deg]"></div>
                    
                    <div class="relative overflow-hidden w-full aspect-[4/5]">
                        <img
                            v-for="(photo, index) in coverPhotos"
                            :key="photo + index"
                            :src="photo"
                            alt="Cover"
                            class="absolute inset-0 w-full h-full object-cover object-top photo-filter transition-opacity duration-1000 transform hover:scale-110"
                            :class="index === activeCoverIndex ? 'opacity-100' : 'opacity-0'"
                        >
                    </div>

                    <div v-if="coverPhotos.length > 1 && !opened" class="flex gap-1.5 mt-4 justify-center">
                        <span
                            v-for="(photo, index) in coverPhotos"
                            :key="'dot-' + index"
                            class="h-1.5 w-1.5 rounded-full transition-colors"
                            :class="index === activeCoverIndex ? 'bg-[var(--ink)]' : 'bg-[var(--ink)]/30'"
                        ></span>
                    </div>
                    
                    <div class="absolute bottom-4 left-0 w-full text-center">
                        <p class="font-hand text-4xl font-bold text-[var(--ink)] drop-shadow-sm">{{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}</p>
                        <p v-if="!opened" class="font-script text-sm text-[var(--ink)]/60 mt-1">Tap to open our story</p>
                    </div>
                </div>

                <div class="mt-16 text-center stamp-in" style="transition-delay: 500ms;">
                    <p class="font-serif italic text-white/50 mb-2 tracking-widest text-sm uppercase">Chapter One</p>
                    <h1 class="font-hand text-6xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">A Beautiful Journey</h1>
                </div>

                <div v-if="!opened" class="absolute bottom-8 left-0 right-0 text-center">
                    <p class="font-serif text-sm text-white/60 mb-1">Kepada Yth.</p>
                    <p class="font-serif italic text-xl text-white font-bold">{{ guest?.name ?? 'Tamu Undangan' }}</p>
                </div>
            </section>

            <!-- Main Board (Hidden Initially) -->
            <div v-show="opened" id="mainContent" class="relative pb-10">
                
                <!-- audio control -->
                <button
                    @click="toggleMusic"
                    class="fixed top-5 right-5 z-50 w-10 h-10 rounded-full border border-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    :class="isPlaying ? 'bg-[var(--accent)] text-white' : 'bg-[var(--board)] text-white/50'"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                </button>

                <!-- Torn Paper Divider -->
                <div class="torn-paper z-20"></div>

                <!-- The "Desk" Content -->
                <div class="bg-[var(--vintage)] relative pt-20 pb-32 px-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] text-[var(--ink)]">
                    
                    <!-- Sticky Notes Background Pattern -->
                    <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"></div>

                    <!-- Couple Presentation -->
                    <div class="text-center mb-20 relative z-10 drop-in">
                        <h2 class="font-hand text-5xl text-[var(--ink)]">The Main Characters</h2>
                        <svg class="w-48 h-4 mx-auto mt-2 text-[var(--ink)]/30" viewBox="0 0 200 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 10 Q 50 20, 100 10 T 195 10"/></svg>
                    </div>

                    <div class="flex flex-col gap-12 items-center justify-center max-w-sm mx-auto relative z-10">
                        
                        <!-- Groom Polaroid -->
                        <div class="premium-polaroid transform -rotate-3 w-64 drop-in" style="transition-delay: 200ms;">
                            <div class="paperclip"></div>
                            <img :src="photoUrl(groom?.photo)" :alt="groom?.full_name" class="w-full aspect-square object-cover object-top photo-filter">
                            <div class="mt-4 text-center">
                                <p class="font-script text-3xl font-bold text-[var(--ink)]">{{ groom?.nickname ?? groom?.full_name }}</p>
                                <p class="font-serif italic text-xs text-[var(--ink)]/50 mt-1">"The lucky guy"</p>
                                <p class="font-sans text-[10px] uppercase tracking-widest mt-2 text-[var(--ink)]/60">Putra dari Bapak {{ groom?.father_name }} & Ibu {{ groom?.mother_name }}</p>
                            </div>
                        </div>

                        <!-- Ampersand -->
                        <div class="font-serif italic text-6xl text-[var(--accent)]/40 font-bold drop-in" style="transition-delay: 400ms;">&</div>

                        <!-- Bride Polaroid -->
                        <div class="premium-polaroid transform rotate-6 w-64 drop-in" style="transition-delay: 600ms;">
                            <div class="masking-tape top-[-10px] right-[-10px] transform rotate-[45deg]"></div>
                            <img :src="photoUrl(bride?.photo)" :alt="bride?.full_name" class="w-full aspect-square object-cover object-top photo-filter">
                            <div class="mt-4 text-center">
                                <p class="font-script text-3xl font-bold text-[var(--ink)]">{{ bride?.nickname ?? bride?.full_name }}</p>
                                <p class="font-serif italic text-xs text-[var(--ink)]/50 mt-1">"The beautiful bride"</p>
                                <p class="font-sans text-[10px] uppercase tracking-widest mt-2 text-[var(--ink)]/60">Putri dari Bapak {{ bride?.father_name }} & Ibu {{ bride?.mother_name }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Event Details (Notebook paper) -->
                    <div class="max-w-2xl mx-auto mt-32 relative drop-in z-10">
                        <!-- Pushpins -->
                        <div class="absolute -top-3 left-4 w-6 h-6 rounded-full bg-red-800 shadow-[2px_5px_5px_rgba(0,0,0,0.5)] border-2 border-red-900 z-20 before:content-[''] before:absolute before:top-1 before:left-1 before:w-1.5 before:h-1.5 before:bg-white/40 before:rounded-full"></div>
                        <div class="absolute -top-3 right-4 w-6 h-6 rounded-full bg-red-800 shadow-[2px_5px_5px_rgba(0,0,0,0.5)] border-2 border-red-900 z-20 before:content-[''] before:absolute before:top-1 before:left-1 before:w-1.5 before:h-1.5 before:bg-white/40 before:rounded-full"></div>

                        <div class="bg-white p-8 md:p-12 shadow-[0_15px_35px_rgba(0,0,0,0.15)] transform rotate-1 rounded-sm relative overflow-hidden">
                            <!-- Notebook lines -->
                            <div class="absolute inset-0 pointer-events-none" style="background-image: repeating-linear-gradient(transparent, transparent 31px, #60A5FA33 31px, #60A5FA33 32px); margin-top: 60px;"></div>
                            <div class="absolute left-8 top-0 bottom-0 w-[2px] bg-red-400/30"></div>

                            <h3 class="font-hand text-5xl mb-8 pl-8 text-[var(--ink)]">Save the Date!</h3>
                            
                            <div class="pl-8 space-y-8 font-script text-2xl text-[var(--ink)]/80 leading-relaxed relative z-10">
                                <div v-if="akad" class="flex items-start gap-4">
                                    <span class="text-[var(--accent)] text-3xl">❤</span>
                                    <div>
                                        <p class="font-bold text-3xl text-[var(--ink)]">Akad Nikah</p>
                                        <p class="text-xl">{{ formatLongDate(akad.date) }}</p>
                                        <p class="text-xl">{{ formatTime(akad.time) }} WIB - Selesai</p>
                                        <p class="text-lg leading-tight mt-1">{{ akad.address ?? akad.place }}</p>
                                        <a v-if="invitation?.maps_link" :href="invitation.maps_link" target="_blank" class="inline-block mt-2 font-serif text-[10px] tracking-widest uppercase font-bold text-[var(--accent)] border-b border-[var(--accent)]">Google Maps</a>
                                    </div>
                                </div>
                                
                                <div v-if="resepsi" class="flex items-start gap-4">
                                    <span class="text-[var(--accent)] text-3xl">🎉</span>
                                    <div>
                                        <p class="font-bold text-3xl text-[var(--ink)]">Resepsi</p>
                                        <p class="text-xl">{{ formatLongDate(resepsi.date) }}</p>
                                        <p class="text-xl">Pukul {{ formatTime(resepsi.time) }} WIB</p>
                                        <p class="text-lg leading-tight mt-1">{{ resepsi.address ?? resepsi.place }}</p>
                                        <a v-if="invitation?.maps_link" :href="invitation.maps_link" target="_blank" class="inline-block mt-2 font-serif text-[10px] tracking-widest uppercase font-bold text-[var(--accent)] border-b border-[var(--accent)]">Google Maps</a>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-8 text-center relative z-10">
                                <a :href="calendarHref" target="_blank" class="font-serif italic text-sm bg-[var(--ink)] text-white px-6 py-2 hover:bg-[var(--accent)] transition-colors shadow-md inline-block">Simpan Tanggal</a>
                            </div>
                        </div>
                    </div>
                    
                </div> <!-- End Desk Content -->

                <!-- Our Journey Timeline -->
                <div class="py-20 px-4 bg-[var(--vintage)] relative shadow-[inset_0_0_50px_rgba(0,0,0,0.1)] z-10 text-[var(--ink)]">
                    <div class="text-center mb-8 drop-in">
                        <p class="font-sans uppercase tracking-[0.2em] text-[10px] font-bold text-[#D48A6A] mb-2">How it started</p>
                        <h2 class="font-hand text-6xl text-[var(--ink)] drop-shadow-sm">Our Journey</h2>
                    </div>
                    
                    <div class="max-w-sm mx-auto bg-white border-2 border-dashed border-[#D48A6A]/40 p-6 pt-10 drop-in relative shadow-[0_15px_30px_rgba(0,0,0,0.1)]">
                        
                        <div class="space-y-10">
                            <div v-for="(item, index) in invitation.love_stories" :key="item.id" class="flex gap-4 items-start">
                                <div class="premium-polaroid w-24 shrink-0 shadow-[0_5px_15px_rgba(0,0,0,0.1)] p-1 pb-4 transform" :class="index % 2 === 0 ? '-rotate-3' : 'rotate-2'">
                                    <img :src="photoUrl(bride?.photo)" class="w-full aspect-square object-cover photo-filter">
                                </div>
                                <div>
                                    <p class="font-script text-xl font-bold text-[#D48A6A]">{{ item.title }}</p>
                                    <p class="font-sans text-sm text-[var(--ink)]/80 mt-1 leading-relaxed">{{ item.description }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="text-center pt-8 mt-8 border-t border-dashed border-[#D48A6A]/30">
                            <p class="font-hand text-3xl font-bold text-[#D48A6A]">With love, {{ groom?.nickname ?? groom?.full_name }} &amp; {{ bride?.nickname ?? bride?.full_name }}</p>
                        </div>
                    </div>
                </div>

                <!-- Our Moments Gallery -->
                <div class="py-16 px-4 bg-[var(--board)] relative border-y-4 border-[var(--ink)] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] z-0">
                    <h2 class="font-hand text-5xl text-white text-center mb-10 drop-in">Our Moments</h2>
                    
                    <div class="max-w-sm mx-auto drop-in">
                        <div class="premium-polaroid transform rotate-1 hover:rotate-0 w-full mb-4 cursor-default p-4 pb-16">
                            <div class="masking-tape top-[-10px] left-1/2 -translate-x-1/2"></div>
                            <div class="relative w-full aspect-[4/3] overflow-hidden rounded shadow-inner">
                                <img :src="mainGalleryImg" class="w-full h-full object-cover object-top photo-filter transition-opacity duration-300">
                                <button @click="prevGallery" class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/40 text-white rounded-full backdrop-blur hover:bg-black/60 transition z-20">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-6 h-6"><path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                                <button @click="nextGallery" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/40 text-white rounded-full backdrop-blur hover:bg-black/60 transition z-20">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-6 h-6"><path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                            </div>
                        </div>
                        
                        <div ref="thumbsWrap" class="flex gap-2 overflow-x-auto py-2 snap-x hide-scroll">
                            <img 
                                v-for="(img, idx) in galleryImages"
                                :key="idx"
                                :src="img"
                                @click="setGallery(idx)"
                                class="w-16 h-16 object-cover object-top cursor-pointer snap-start shrink-0 transition-all photo-filter"
                                :class="idx === currentGalIdx ? 'border-white border-[3px]' : 'opacity-50 hover:opacity-100 border-[3px] border-white/50'"
                            >
                        </div>
                    </div>
                </div>

                <!-- Tanda Kasih (Postcard style) -->
                <div v-if="invitation?.accounts?.length" class="py-20 px-4 relative z-10 bg-[#e0d6c8] shadow-[inset_0_0_50px_rgba(0,0,0,0.1)] text-[var(--ink)]">
                    <div class="text-center mb-12 drop-in">
                        <h2 class="font-hand text-5xl text-[var(--ink)]">Tanda Kasih</h2>
                        <p class="font-script text-xl text-[var(--ink)]/70 mt-2">Kirim kado untuk kami</p>
                    </div>
                    
                    <div class="max-w-sm mx-auto flex flex-col gap-8 justify-center">
                        <div v-for="(account, index) in invitation.accounts" :key="account.id" class="bg-[var(--paper)] p-6 shadow-[0_10px_20px_rgba(0,0,0,0.15)] relative drop-in flex-1 max-w-sm mx-auto w-full transform" :class="index % 2 === 0 ? '-rotate-2' : 'rotate-1'">
                            <div class="masking-tape top-[-15px]" :class="index % 2 === 0 ? 'right-2 rotate-12' : 'left-2 -rotate-6'"></div>
                            <div class="border-2 border-[var(--ink)]/10 border-dashed p-4 text-center">
                                <p class="font-serif font-bold text-[var(--ink)] uppercase tracking-widest text-sm mb-2">{{ account.bank_name }}</p>
                                <p class="font-script text-4xl text-[var(--ink)] font-bold mb-1">{{ account.account_number }}</p>
                                <p class="font-hand text-2xl text-[var(--ink)]/60 mb-6">a.n. {{ account.account_holder }}</p>
                                <button @click="copyAccount(account.account_number)" class="font-serif italic text-sm bg-[var(--ink)] text-white px-6 py-2 hover:bg-[var(--accent)] transition-colors shadow-md">Salin Rekening</button>
                            </div>
                        </div>

                        <div v-if="invitation?.gift_address" class="bg-[var(--paper)] p-6 shadow-[0_10px_20px_rgba(0,0,0,0.15)] relative transform rotate-1 drop-in flex-1 max-w-sm mx-auto w-full mt-4">
                            <div class="masking-tape top-[-15px] left-1/2 -translate-x-1/2 rotate-2"></div>
                            <div class="border-2 border-[var(--ink)]/10 border-dashed p-4 text-center">
                                <p class="font-serif font-bold text-[var(--ink)] uppercase tracking-widest text-sm mb-2 text-[var(--accent)]">Kirim Kado Fisik</p>
                                <p class="font-hand text-3xl font-bold text-[var(--ink)] mb-1">{{ invitation.gift_address.receiver_name }}</p>
                                <p class="font-sans text-sm text-[var(--ink)]/80 mt-2">{{ invitation.gift_address.address }}</p>
                                <p v-if="invitation.gift_address.phone" class="font-sans text-sm text-[var(--ink)]/80 mt-1">{{ invitation.gift_address.phone }}</p>
                            </div>
                        </div>
                    </div>
                    <p class="text-center font-hand text-3xl text-[var(--accent)] mt-8 h-8 transition-opacity" :class="copyToast ? 'opacity-100' : 'opacity-0'">{{ copyToast }}</p>
                </div>

                <!-- RSVP (Telegram style) -->
                <div class="py-24 px-4 relative z-10 bg-[var(--board)]">
                    <div class="max-w-lg mx-auto bg-[var(--vintage)] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform -rotate-1 relative drop-in text-[var(--ink)]">
                        <!-- Pushpin -->
                        <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-800 shadow-[2px_5px_5px_rgba(0,0,0,0.5)] border-2 border-slate-900 z-20 before:content-[''] before:absolute before:top-1 before:left-1 before:w-1.5 before:h-1.5 before:bg-white/40 before:rounded-full"></div>
                        
                        <div class="border-4 border-double border-[var(--ink)]/20 p-6">
                            <div class="text-center mb-8 border-b-2 border-[var(--ink)]/20 pb-4">
                                <p class="font-serif uppercase tracking-[0.3em] text-xs font-bold text-[var(--ink)]">Telegram / RSVP</p>
                                <h2 class="font-hand text-5xl text-[var(--ink)] mt-2">Kehadiran</h2>
                            </div>

                            <form @submit.prevent="submitWish" class="space-y-6">
                                <div>
                                    <label class="block font-script text-2xl text-[var(--ink)] mb-1">Nama Tamu:</label>
                                    <input v-model="form.name" type="text" required class="w-full bg-transparent border-b-2 border-[var(--ink)]/30 py-2 text-[var(--ink)] font-hand text-3xl focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="Tulis nama anda...">
                                </div>
                                
                                <div>
                                    <label class="block font-script text-2xl text-[var(--ink)] mb-3">Kehadiran:</label>
                                    <div class="flex gap-4">
                                        <label class="flex-1 cursor-pointer">
                                            <input v-model="form.attendance" type="radio" name="attendance" value="hadir" class="peer hidden" required>
                                            <div class="w-full py-3 text-center border-2 border-[var(--ink)]/30 text-[var(--ink)]/50 font-serif font-bold text-sm uppercase peer-checked:bg-[var(--ink)] peer-checked:text-white peer-checked:border-[var(--ink)] transition-all">Hadir</div>
                                        </label>
                                        <label class="flex-1 cursor-pointer">
                                            <input v-model="form.attendance" type="radio" name="attendance" value="tidak_hadir" class="peer hidden">
                                            <div class="w-full py-3 text-center border-2 border-[var(--ink)]/30 text-[var(--ink)]/50 font-serif font-bold text-sm uppercase peer-checked:bg-[var(--ink)] peer-checked:text-white peer-checked:border-[var(--ink)] transition-all">Maaf</div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label class="block font-script text-2xl text-[var(--ink)] mb-1">Pesan & Doa:</label>
                                    <textarea v-model="form.message" required rows="3" class="w-full bg-transparent border-b-2 border-[var(--ink)]/30 py-2 text-[var(--ink)] font-hand text-3xl focus:outline-none focus:border-[var(--accent)] transition-colors resize-none" placeholder="Tulis doa anda..."></textarea>
                                </div>

                                <!-- Wax Seal Submit Button -->
                                <div class="text-center pt-8">
                                    <button type="submit" :disabled="form.processing" class="relative group mx-auto block disabled:opacity-60 disabled:cursor-not-allowed">
                                        <div class="w-24 h-24 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-[inset_0_-5px_15px_rgba(0,0,0,0.5),0_5px_10px_rgba(0,0,0,0.4)] border border-red-900 group-hover:scale-105 transition-transform mx-auto">
                                            <span class="font-serif italic text-white text-3xl opacity-80">Cap</span>
                                        </div>
                                        <p class="font-serif text-[10px] font-bold uppercase tracking-widest text-[var(--ink)] mt-4 group-hover:text-[var(--accent)] transition-colors">Kirim Balasan</p>
                                    </button>
                                </div>
                                <p class="text-center font-hand text-2xl text-[var(--accent)] mt-4 h-6">{{ rsvpMsg }}</p>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Feed / Comments -->
                    <div class="max-w-lg mx-auto mt-16 space-y-6 drop-in">
                        <div v-if="!wishes.length" class="text-center text-sm text-white/40 font-serif italic py-6">Jadilah yang pertama mengirim ucapan.</div>

                        <div class="max-h-[400px] overflow-y-auto pr-2 hide-scroll space-y-6">
                            <div v-for="wish in pagedWishes" :key="wish.id" class="bg-[var(--paper)] p-5 shadow-[0_5px_15px_rgba(0,0,0,0.5)] transform stamp-in active text-[var(--ink)]" :class="wish.id % 2 === 0 ? 'rotate-1' : '-rotate-1'">
                                <div class="flex justify-between items-center border-b border-[var(--ink)]/10 pb-2 mb-3">
                                    <span class="font-script text-3xl font-bold text-[var(--ink)]">{{ wish.name }}</span>
                                    <span class="text-xs font-serif uppercase tracking-widest bg-[var(--ink)] text-white px-3 py-1">{{ attendanceLabel(wish.attendance) }}</span>
                                </div>
                                <p class="font-hand text-3xl text-[var(--ink)]/80 leading-tight">{{ wish.message }}</p>
                            </div>
                        </div>

                        <div v-if="wishes.length" class="flex items-center justify-center gap-2 mt-8">
                            <button
                                @click="goToWishesPage(wishesPage - 1)"
                                :disabled="wishesPage === 1"
                                class="w-8 h-8 rounded-full flex items-center justify-center border border-white/30 text-white transition-all"
                                :class="wishesPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:text-[var(--board)]'"
                            >
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </button>
                            <button
                                v-for="p in wishesPageNumbers"
                                :key="p"
                                @click="goToWishesPage(p)"
                                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-serif font-bold transition-all"
                                :class="p === wishesPage ? 'bg-white text-[var(--board)]' : 'border border-white/30 text-white hover:bg-white hover:text-[var(--board)]'"
                            >
                                {{ p }}
                            </button>
                            <button
                                @click="goToWishesPage(wishesPage + 1)"
                                :disabled="wishesPage === totalWishesPages"
                                class="w-8 h-8 rounded-full flex items-center justify-center border border-white/30 text-white transition-all"
                                :class="wishesPage === totalWishesPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:text-[var(--board)]'"
                            >
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

            </div> <!-- End Main Content -->

        </div> <!-- End App Wrap -->

    </div>
</template>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,600&family=Shadows+Into+Light&display=swap');

  :root {
      --board: #2A2C2B;
      --paper: #FDFBF7;
      --vintage: #F3E9D2;
      --ink: #1A1A1A;
      --accent: #8B3A3A;
  }
  
  html{scroll-behavior:smooth;}
  
  .font-hand { font-family: 'Caveat', cursive; }
  .font-serif { font-family: 'Playfair Display', serif; }
  .font-script { font-family: 'Shadows Into Light', cursive; }

  /* Vignette and Texture */
  body {
      background-color: var(--board);
      background-image: 
          radial-gradient(circle at center, transparent 0%, #111 120%),
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
      color: var(--ink);
      overflow-x: hidden;
  }

  /* 3D Floating Polaroid */
  .premium-polaroid {
      background: #fff;
      padding: 15px 15px 60px 15px;
      box-shadow: 
          0 20px 40px rgba(0,0,0,0.4),
          inset 0 0 40px rgba(200,180,150,0.1);
      position: relative;
      transform-style: preserve-3d;
      transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      border-radius: 2px;
  }
  .premium-polaroid:hover {
      transform: translateY(-10px) scale(1.02) rotate(2deg);
      box-shadow: 
          0 30px 60px rgba(0,0,0,0.5),
          inset 0 0 40px rgba(200,180,150,0.1);
      z-index: 50;
  }
  
  .photo-filter {
      filter: contrast(1.1) brightness(0.9) sepia(0.3);
      border-radius: 2px;
      box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
  }

  /* Realistic Masking Tape */
  .masking-tape {
      position: absolute;
      width: 120px;
      height: 35px;
      background-color: rgba(255, 255, 255, 0.35);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      backdrop-filter: blur(4px);
      z-index: 10;
      border-left: 3px dashed rgba(0,0,0,0.1);
      border-right: 3px dashed rgba(0,0,0,0.1);
      background-image: linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.1) 50%);
      background-size: 4px 100%;
  }

  /* Swing Animation for Hero */
  @keyframes swing {
      0% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
      100% { transform: rotate(-3deg); }
  }
  .swinging {
      transform-origin: top center;
      animation: swing 6s ease-in-out infinite;
  }

  /* Paperclip */
  .paperclip {
      position: absolute;
      top: -25px;
      left: 20px;
      width: 30px;
      height: 70px;
      border: 4px solid #B0BEC5;
      border-radius: 15px;
      background: transparent;
      box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
      z-index: 20;
      clip-path: polygon(0 0, 100% 0, 100% 80%, 0 80%);
  }

  /* Torn Paper Edge Divider */
  .torn-paper {
      width: 100%;
      height: 40px;
      background: var(--vintage);
      position: relative;
      box-shadow: 0 -10px 20px rgba(0,0,0,0.3);
  }
  .torn-paper::after {
      content: "";
      position: absolute;
      bottom: -15px;
      left: 0;
      width: 100%;
      height: 15px;
      background: linear-gradient(-45deg, transparent 75%, var(--vintage) 75%) 0 50%,
                  linear-gradient( 45deg, transparent 75%, var(--vintage) 75%) 0 50%;
      background-repeat: repeat-x;
      background-size: 15px 30px;
  }

  /* Drop & Bounce Animation */
  .drop-in {
      opacity: 0;
      transform: translateY(-100px) scale(1.2) rotate(15deg);
      transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .drop-in.active {
      opacity: 1;
      transform: translateY(0) scale(1) rotate(0);
  }
  
  .stamp-in {
      opacity: 0;
      transform: scale(2);
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .stamp-in.active {
      opacity: 1;
      transform: scale(1);
  }

  /* Custom Scrollbar */
  .hide-scroll::-webkit-scrollbar { display: none; }
  .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
</style>
