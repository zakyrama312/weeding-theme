<script setup>
import { useFormatters } from '@/Composables/useFormatters'
import { Head } from '@inertiajs/vue3'
import { ref, computed, onMounted } from 'vue'
import {
    useWishesPagination,
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

const groom = computed(() => props.invitation?.couples?.find((c) => c.type === 'groom'))
const bride = computed(() => props.invitation?.couples?.find((c) => c.type === 'bride'))
const akad = computed(() => props.invitation?.events?.find((e) => e.type === 'akad'))
const resepsi = computed(() => props.invitation?.events?.find((e) => e.type === 'resepsi'))

const heroDateText = computed(() => {
    const date = resepsi.value?.date ?? akad.value?.date
    if (!date) return 'Sunday, October 25, 2026'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const galleryImages = computed(() => {
    if (props.invitation?.galleries?.length) {
        return props.invitation.galleries.map((g) => ({ src: `/storage/${g.photo}`, caption: g.title ?? 'A beautiful moment.' }))
    }
    return [
        { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop', caption: 'A beautiful walk in the park.' },
        { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop', caption: 'Stolen glances during the evening.' },
        { src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop', caption: 'The engagement ring.' },
        { src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop', caption: 'A tender moment.' },
        { src: 'https://images.unsplash.com/photo-1532712938736-59c715894504?q=80&w=1200&auto=format&fit=crop', caption: 'Looking towards the future together.' }
    ]
})

const displayedThumbnails = computed(() => galleryImages.value.slice(0, 5))
const activeGalleryIndex = ref(0)
const mainGalleryImage = computed(() => displayedThumbnails.value[activeGalleryIndex.value]?.src)
const mainGalleryCaption = computed(() => displayedThumbnails.value[activeGalleryIndex.value]?.caption)

const coverPhotos = computed(() => {
    if (props.invitation?.cover_photos?.length) {
        return props.invitation.cover_photos.map((p) => photoUrl(p.photo))
    }
    return ['https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop']
})

const musicSrc = computed(() =>
    props.invitation?.music
        ? `/storage/${props.invitation.music.file_path}`
        : '/assets/music/elliot-james-reay-love.mp3'
)

const wishes = computed(() => props.invitation?.wishes ?? [])
const attendanceLabel = (value) => (value === 'hadir' ? 'Joyfully Accepts' : 'Regretfully Declines')

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
const copyAccount = (number) => copyAccountRaw(number, 'Account number successfully copied!')

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

onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    });

    document.querySelectorAll('.animate-fade-up').forEach((el) => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
})
</script>

<template>
    <Head :title="invitation?.name ?? 'The Daily Matrimony'" />

    <!-- Audio Player (Hidden) -->
    <audio v-if="invitation" ref="audioEl" :src="musicSrc" loop></audio>

    <div class="font-body antialiased min-h-screen bg-paper-200 text-ink newspaper-bg" :class="{'overflow-hidden': !opened}">

        <!-- Cover Screen -->
        <div id="cover-screen" :class="{'opened': opened}">
            <div class="relative z-10 text-center px-6 w-full max-w-md mx-auto flex flex-col items-center justify-center h-[90vh] border-[4px] double border-ink p-8 m-4 bg-paper-100/90 shadow-2xl mt-8">
                <h1 class="font-newspaper text-6xl text-ink mb-6">The Daily Matrimony</h1>
                <p class="font-serif text-sm tracking-widest uppercase mb-2">Wedding</p>
                <h2 class="font-serif text-4xl mb-8">{{ groom?.nickname ?? groom?.full_name }} & {{ bride?.nickname ?? bride?.full_name }}</h2>
                <p class="font-sans text-xs italic mb-2">To:</p>
                <p class="font-serif text-xl font-bold mb-10">{{ guest?.name ?? 'Invited Guest' }}</p>
                
                <button @click="openInvitation" class="border-2 border-ink bg-ink text-paper-100 px-8 py-3 font-serif font-bold uppercase tracking-widest hover:bg-paper-100 hover:text-ink transition-colors w-full">
                    Read the Edition
                </button>
            </div>
        </div>

        <!-- Main Container -->
        <div class="max-w-4xl mx-auto bg-paper-100 min-h-screen shadow-2xl relative border-x border-paper-300 pb-20">
            
            <!-- Top Info Bar -->
            <div class="flex justify-between items-center py-2 px-6 border-b border-ink text-[10px] md:text-sm font-serif font-semibold uppercase tracking-widest">
                <span>Vol. I — No. 1</span>
                <span>{{ heroDateText }}</span>
                <span>Two Cents</span>
            </div>

            <!-- Header / Masthead -->
            <header class="text-center pt-8 pb-6 px-6 animate-fade-up">
                <h1 class="font-newspaper text-5xl md:text-7xl lg:text-8xl tracking-tight mb-2 text-ink">The Daily Matrimony</h1>
                <div class="newspaper-border-y py-2 mt-6">
                    <p class="font-serif text-base md:text-lg italic tracking-wide">"A Love Story for the Ages: Two Hearts Become One"</p>
                </div>
            </header>

            <!-- Main Content Grid -->
            <main class="px-6 pb-12">
                
                <!-- Hero Article -->
                <article class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 animate-fade-up delay-100">
                    
                    <!-- Left Column (Text) -->
                    <div class="lg:col-span-5 flex flex-col justify-center">
                        <h2 class="font-serif text-3xl md:text-4xl font-bold leading-none mb-4 uppercase">It Is Official! <br> They Are Getting Married</h2>
                        <p class="text-ink-light text-sm font-serif italic mb-4">By The Editorial Board</p>
                        <p class="drop-cap text-justify leading-relaxed mb-4">
                            The city is abuzz with the joyous news of the upcoming nuptials between <span class="font-bold">{{ groom?.nickname ?? groom?.full_name }}</span> and <span class="font-bold">{{ bride?.nickname ?? bride?.full_name }}</span>. 
                            After a whirlwind romance that captured the hearts of many, the couple has finally announced their intention to be wed in holy matrimony.
                        </p>
                        <p class="text-justify leading-relaxed">
                            Friends and family describe their union as a perfect match, written in the stars. The grand event is scheduled to take place this coming autumn, promising an evening of elegance, celebration, and eternal love.
                        </p>
                    </div>

                    <!-- Right Column (Image) -->
                    <div class="lg:col-span-7 border-[3px] border-ink p-2">
                        <div class="border border-ink p-1">
                            <!-- Placeholder for couple image, styled vintage -->
                            <img :src="coverPhotos[0]" alt="The Happy Couple" class="w-full h-[400px] object-cover vintage-img">
                        </div>
                        <p class="text-center text-xs font-serif italic mt-2">The happy couple photographed during their engagement.</p>
                    </div>

                </article>

                <!-- Divider -->
                <div class="flex items-center justify-center space-x-4 mb-12">
                    <div class="h-px bg-ink flex-grow"></div>
                    <span class="font-serif text-2xl">❧</span>
                    <div class="h-px bg-ink flex-grow"></div>
                </div>

                <!-- Details Section -->
                <section class="mb-12 animate-fade-up delay-300">
                    <h3 class="font-serif text-2xl md:text-3xl font-bold text-center uppercase border-b-2 border-ink pb-4 mb-8">The Grand Affair Details</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Holy Matrimony -->
                        <div v-if="akad" class="border border-ink p-6 relative">
                            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-paper-100 px-2 font-serif italic font-bold">The Ceremony</div>
                            <h4 class="font-serif text-2xl text-center mb-2 mt-4">Holy Matrimony</h4>
                            <p class="text-center font-bold mb-4">{{ new Date(akad.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
                            <p class="text-center mb-2">{{ formatTime(akad.time) }} WIB - Selesai</p>
                            <p class="text-center italic mb-4">{{ akad.place }}<br>{{ akad.address }}</p>
                            <div class="text-center">
                                <a v-if="invitation?.maps_link" :href="invitation.maps_link" target="_blank" class="inline-block border border-ink px-4 py-1 text-sm uppercase tracking-widest hover:bg-ink hover:text-paper-100 transition-colors">View Map</a>
                            </div>
                        </div>

                        <!-- Reception -->
                        <div v-if="resepsi" class="border border-ink p-6 relative">
                            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-paper-100 px-2 font-serif italic font-bold">The Celebration</div>
                            <h4 class="font-serif text-2xl text-center mb-2 mt-4">Wedding Reception</h4>
                            <p class="text-center font-bold mb-4">{{ new Date(resepsi.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
                            <p class="text-center mb-2">{{ formatTime(resepsi.time) }} WIB - Selesai</p>
                            <p class="text-center italic mb-4">{{ resepsi.place }}<br>{{ resepsi.address }}</p>
                            <div class="text-center">
                                <a v-if="invitation?.maps_link" :href="invitation.maps_link" target="_blank" class="inline-block border border-ink px-4 py-1 text-sm uppercase tracking-widest hover:bg-ink hover:text-paper-100 transition-colors">View Map</a>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Gallery Section -->
                <section class="mb-12 animate-fade-up delay-300">
                    <h3 class="font-serif text-2xl md:text-3xl font-bold text-center uppercase border-b-2 border-ink pb-4 mb-8">Captured Moments</h3>
                    
                    <div class="border-[4px] double border-ink p-2 mb-4 bg-paper-200">
                        <div class="border border-ink p-1 relative">
                            <img :src="mainGalleryImage" class="w-full h-64 md:h-[400px] object-cover vintage-img transition-opacity duration-300">
                        </div>
                        <p class="text-center font-serif italic text-sm mt-3 pb-1 transition-opacity duration-300">{{ mainGalleryCaption }}</p>
                    </div>
                    
                    <!-- Thumbnails -->
                    <div class="grid grid-cols-5 gap-2 md:gap-4">
                        <button v-for="(img, idx) in displayedThumbnails" :key="idx" type="button" @click="activeGalleryIndex = idx" class="transition-all gallery-thumb bg-paper-100" :class="activeGalleryIndex === idx ? 'border-[3px] border-ink p-1 opacity-100' : 'border border-ink/30 p-1 opacity-50 hover:opacity-100'">
                            <img :src="img.src" class="w-full h-12 md:h-20 object-cover vintage-img">
                        </button>
                    </div>
                </section>

                <!-- Tanda Kasih Section -->
                <section v-if="invitation?.accounts?.length" class="mb-12 animate-fade-up delay-500">
                    <h3 class="font-serif text-3xl md:text-4xl font-bold text-center uppercase border-b-2 border-ink pb-4 mb-8">Wishing Well</h3>
                    <p class="text-center font-serif italic mb-6">For those who wish to bless us with a gift, you may send it via the following accounts:</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div v-for="account in invitation.accounts" :key="account.id" class="border border-ink p-6 text-center relative bg-paper-200">
                            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-paper-100 px-2 font-serif italic font-bold">Bank {{ account.bank_name }}</div>
                            <h4 class="font-serif text-2xl mt-4 mb-2">{{ account.account_number }}</h4>
                            <p class="font-bold mb-4 uppercase text-sm">a.n. {{ account.account_holder }}</p>
                            <button @click="copyAccount(account.account_number)" class="inline-block border border-ink px-4 py-1 text-xs uppercase tracking-widest hover:bg-ink hover:text-paper-100 transition-colors">Copy Number</button>
                        </div>
                        <div v-if="invitation?.gift_address" class="border border-ink p-6 text-center relative bg-paper-200">
                            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-paper-100 px-2 font-serif italic font-bold">Kirim Kado Fisik</div>
                            <h4 class="font-serif text-lg mt-4 mb-2">{{ invitation.gift_address.receiver_name }}</h4>
                            <p class="font-bold mb-4 text-xs italic">{{ invitation.gift_address.address }}</p>
                            <p class="font-bold mb-4 text-xs italic opacity-70" v-if="invitation.gift_address.phone">{{ invitation.gift_address.phone }}</p>
                        </div>
                    </div>
                    <p class="text-xs text-center font-bold mt-4 h-4 transition-opacity duration-300" :style="{ opacity: copyToast ? 1 : 0 }">{{ copyToast }}</p>
                </section>

                <!-- RSVP Section -->
                <section class="border-[3px] border-ink p-8 mb-12 animate-fade-up delay-500 bg-paper-200">
                    <h3 class="font-serif text-3xl font-bold text-center uppercase mb-2">Guest Book</h3>
                    <p class="text-center font-serif italic mb-6">Your presence and blessings are our greatest honor</p>
                    
                    <form @submit.prevent="submitWish" class="max-w-md mx-auto space-y-4">
                        <div>
                            <label class="block font-serif font-bold text-sm uppercase mb-1">Full Name</label>
                            <input v-model="form.name" type="text" required class="w-full bg-transparent border-b border-ink focus:outline-none focus:border-b-2 px-2 py-1 placeholder-ink-light/50" placeholder="Enter your name">
                        </div>
                        <div>
                            <label class="block font-serif font-bold text-sm uppercase mb-1 mt-4">Will you attend?</label>
                            <div class="flex space-x-6 mt-2">
                                <label class="flex items-center space-x-2 cursor-pointer rsvp-radio">
                                    <input v-model="form.attendance" type="radio" name="attendance" value="hadir" class="accent-ink w-4 h-4" required>
                                    <span class="font-serif">Joyfully Accepts</span>
                                </label>
                                <label class="flex items-center space-x-2 cursor-pointer rsvp-radio">
                                    <input v-model="form.attendance" type="radio" name="attendance" value="tidak_hadir" class="accent-ink w-4 h-4">
                                    <span class="font-serif">Regretfully Declines</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label class="block font-serif font-bold text-sm uppercase mb-1 mt-4">Message & Wishes</label>
                            <textarea v-model="form.message" required rows="3" class="w-full bg-transparent border border-ink focus:outline-none focus:border-2 px-2 py-2 text-sm resize-none" placeholder="Write your wishes for the couple..."></textarea>
                        </div>
                        <div class="pt-4 text-center">
                            <button type="submit" :disabled="form.processing" class="border-2 border-ink bg-ink text-paper-100 px-8 py-2 font-serif font-bold uppercase tracking-widest hover:bg-paper-100 hover:text-ink transition-colors w-full disabled:opacity-50">
                                Send Reply
                            </button>
                        </div>
                        <p class="text-center font-serif text-[11px] text-ink-light mt-2">{{ rsvpMsg }}</p>
                    </form>

                    <!-- Comment Feed -->
                    <div class="mt-8 space-y-4 pr-2">
                        <div v-for="wish in pagedWishes" :key="wish.id" class="border border-ink p-4 bg-paper-100 animate-fade-up" style="animation-play-state: running;">
                            <div class="flex items-center justify-between mb-2 border-b border-ink/30 pb-2">
                                <h4 class="font-serif font-bold text-ink uppercase text-sm">{{ wish.name }}</h4>
                                <span class="px-2 py-1 border border-ink text-[9px] uppercase font-bold tracking-wider">{{ attendanceLabel(wish.attendance) }}</span>
                            </div>
                            <p class="font-body text-sm leading-relaxed">{{ wish.message }}</p>
                        </div>
                        
                        <div v-if="wishes.length" class="flex justify-center gap-2 mt-6">
                            <button @click="goToWishesPage(wishesPage - 1)" :disabled="wishesPage === 1" class="border border-ink px-2 py-1 disabled:opacity-30">&lt;</button>
                            <button v-for="p in wishesPageNumbers" :key="p" @click="goToWishesPage(p)" class="border border-ink px-3 py-1" :class="wishesPage === p ? 'bg-ink text-paper-100' : ''">{{ p }}</button>
                            <button @click="goToWishesPage(wishesPage + 1)" :disabled="wishesPage === totalWishesPages" class="border border-ink px-2 py-1 disabled:opacity-30">&gt;</button>
                        </div>
                    </div>
                </section>

                <!-- Love Story Snippet -->
                <section class="col-count-2 text-justify leading-relaxed border-t border-b border-ink py-6 mb-8 text-sm">
                    <h3 class="font-serif text-xl font-bold uppercase mb-2">Classifieds: A Love Found</h3>
                    <p class="mb-2" v-for="(story, idx) in invitation?.love_stories" :key="idx"><strong class="font-serif">{{ story.title }} - </strong> {{ story.description }}</p>
                    <p class="mb-2" v-if="!invitation?.love_stories?.length">It started on a rainy afternoon at the local library. A shared umbrella, a conversation over classic literature, and the rest, as they say, is history. Through seasons of change and years of growth, their bond only strengthened.</p>
                    <p>We invite you to be part of the next chapter. Your presence is the greatest gift of all. For those wishing to contribute to their new life together, a wishing well will be available at the reception.</p>
                </section>

            </main>

            <!-- Footer -->
            <footer class="bg-ink text-paper-100 text-center py-4 px-6 text-xs font-serif uppercase tracking-widest">
                <p>Printed by The WeedingBuilder Press &copy; 2026</p>
            </footer>

        </div>

        <!-- Floating Music Button -->
        <button v-show="opened" @click="toggleMusic" class="fixed bottom-6 right-6 w-12 h-12 bg-ink text-paper-100 rounded-full flex items-center justify-center shadow-lg hover:opacity-80 transition-all duration-300 z-50">
            <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>

    </div>
</template>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&family=UnifrakturMaguntia&display=swap');
    
    .font-newspaper { font-family: 'UnifrakturMaguntia', serif; }
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-body { font-family: 'Lora', serif; }

    .bg-paper-100 { background-color: #f9f7f1; }
    .bg-paper-100\/90 { background-color: rgba(249, 247, 241, 0.9); }
    .bg-paper-200 { background-color: #f4f1ea; }
    .bg-paper-300 { background-color: #e8e3d3; }
    
    .border-ink { border-color: #1c1c1c; }
    .border-ink\/30 { border-color: rgba(28, 28, 28, 0.3); }
    .border-paper-300 { border-color: #e8e3d3; }
    
    .text-ink { color: #1c1c1c; }
    .text-ink-light { color: #3d3d3d; }
    .text-paper-100 { color: #f9f7f1; }
    
    .bg-ink { background-color: #1c1c1c; }
    .bg-ink-light { background-color: #3d3d3d; }
    
    .accent-ink { accent-color: #1c1c1c; }
    
    .placeholder-ink-light\/50::placeholder { color: rgba(61, 61, 61, 0.5); }

    .newspaper-bg {
        background-color: #f4f1ea;
        color: #1c1c1c;
        background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png');
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #e8e3d3; }
    ::-webkit-scrollbar-thumb { background: #1c1c1c; }
    
    .newspaper-border { border: 4px double #1c1c1c; }
    .newspaper-border-y { border-top: 4px double #1c1c1c; border-bottom: 4px double #1c1c1c; }
    
    .drop-cap::first-letter {
        float: left;
        font-size: 4rem;
        line-height: 0.8;
        padding-right: 0.5rem;
        padding-top: 0.2rem;
        font-family: 'Playfair Display', serif;
        font-weight: 900;
    }
    
    .col-count-2 { column-count: 1; }
    @media (min-width: 768px) {
        .col-count-2 {
            column-count: 2;
            column-gap: 2rem;
        }
    }
    
    .vintage-img {
        filter: grayscale(100%) contrast(120%) sepia(20%);
        mix-blend-mode: multiply;
    }
    
    #cover-screen {
        position: fixed;
        inset: 0;
        z-index: 100;
        background-color: #f4f1ea;
        background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png');
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 1.2s cubic-bezier(0.77, 0, 0.175, 1), opacity 1.2s ease;
    }
    #cover-screen.opened {
        transform: translateY(-100%);
        opacity: 0;
        pointer-events: none;
    }

    @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
        animation: fadeUp 1s ease-out forwards;
        opacity: 0;
    }
    .delay-100 { animation-delay: 100ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-500 { animation-delay: 500ms; }
</style>
