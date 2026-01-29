# Detail Rancangan Web Ophius Stuio (Ophiucus)

Iya, ini sangat memungkinkan dibuat di web, bahkan bisa mendekati vibe “Active Theory” yang kamu maksud, karena yang bikin kerasa hidup itu bukan model 3D statis, tapi kombinasi real-time rendering: shader, partikel, post-processing, kamera yang “dikoreografi”, dan sistem UI 3D yang benar-benar interaktif.

Yang paling penting: web kamu ini sebenarnya “aplikasi 3D” yang kebetulan berisi UI, bukan “website biasa yang ditambah 3D”. Jadi cara ngerjainnya pun harus dipikir sebagai satu scene 3D dengan beberapa mode (explore 360°, fokus panel, mode search + keyboard hologram, mode planet navigation).

Kalau ngomong “butuh apa”, fondasinya biasanya pakai Three.js (atau React Three Fiber kalau kamu mau masukin ke stack React biar gampang ngatur state dan routing). Di atas itu kamu butuh pipeline post-processing buat glow/bloom (biar accretion disk black hole kamu “nyala”), lalu sistem shader GLSL untuk inti black hole (event horizon + accretion disk + distorsi), sistem partikel untuk debu/bintang yang bergerak, dan sistem interaksi (raycasting) supaya panel-panel melayang itu benar-benar bisa dipencet, dizoom, dan jadi “halaman” lain.

Black hole yang kamu tunjukin itu bisa dibangun dari beberapa lapisan yang dirender barengan. Intinya ada “event horizon” (bola hitam yang benar-benar gelap), di sekelilingnya ada accretion disk (bentuk piringan/torus atau bahkan quad tipis) tapi materialnya bukan material biasa—ini shader yang ngitung warna per-pixel, bikin aliran cahaya melingkar pakai noise + fungsi trigonometri + parameter waktu, lalu ditambah bloom supaya highlights jadi silau. Kalau kamu mau efek melengkung kayak gravitational lensing, pendekatan web yang paling realistis biasanya pakai screen-space distortion pass (post effect) yang “membengkokkan” background starfield saat melewati area sekitar black hole. Yang versi “super pro” bisa raymarching di fragment shader, tapi itu lebih berat dan perlu banget optimasi.

Desain “web 3D dari POV atas” kamu itu cocok banget dibuat sebagai sistem orbit: kamera berada dekat pusat (atau sedikit offset sesuai kebutuhan), panel-panel sistem berada di ring tengah mengorbit, benda-benda dekor (debu/nebula/artefak) di ring lain, dan background paling jauh adalah starfield plus 12 zodiac yang kamu sebut. Jadi kamu akan punya beberapa radius orbit dan aturan gerak yang konsisten, supaya saat kamera diputar 360° semuanya tetap terasa “satu galaksi” bukan UI yang ditempel.

Bagian panel UI melayang itu biasanya paling enak dibuat sebagai plane geometry (kotak-kotak panel) yang teksturnya bisa berasal dari dua cara. Cara pertama pakai texture image/video (ringan dan stabil). Cara kedua pakai “HTML di dalam 3D” (misalnya lewat Drei Html atau CSS3D) supaya teks tajam, gampang input, gampang layout, tapi perlu hati-hati dengan layering dan pointer-events supaya nggak kejadian “ada lapisan nindih jadi nggak bisa klik” seperti bug yang kamu alami sebelumnya. Kalau targetmu panel bisa di-zoom, bisa di-scroll, bisa ada tombol beneran, biasanya hybrid paling mantap: panel sebagai mesh 3D untuk feel kedalaman, kontennya HTML yang di-anchor ke panel itu, lalu inputnya ditangani jelas mana yang masuk ke 3D dan mana yang masuk ke DOM.

Transisi kayak di video itu kuncinya bukan cuma “animasi kamera”, tapi koreografi semua elemen: kamera bergerak dengan easing halus, panel yang dipilih maju ke depan dan membesar, panel lain mengecil dan menjauh sambil tetap mengorbit, depth-of-field atau blur halus bikin fokus jatuh ke panel utama, partikel ikut “tersedot” atau berubah kecepatan supaya dramanya kerasa. Ini biasanya dikerjain pakai timeline animation (GSAP sering dipakai di project kayak gitu, atau Framer Motion kalau kamu full React), dan kamu bikin semacam state machine: mode bebas 360°, mode fokus panel, mode planet navigation, mode search/keyboard.

Keyboard hologram yang “baru keliatan kalau kamera geser ke bawah” itu tinggal dibuat sebagai objek 3D yang memang ada dari awal, tapi transparansi/posisinya dikontrol oleh pitch kamera. Jadi saat kamera menunduk melewati ambang tertentu, keyboard naik sedikit, opacity naik, dan search bar ketarik ikut turun/terasa “nyambung”. Di mobile, input tetap lebih nyaman kalau yang beneran ngetik pakai input native, tapi visual keyboard hologramnya tetap bisa jadi efek—jadi typing masuk ke input DOM, sementara di scene 3D kamu cuma memantulkan teksnya ke panel.

Logo planet dua cincin buat navigasi juga sangat doable. Anggap itu “hub” di tengah ring, lalu panel-panel jadi satelit. Ketika planet dipencet, planetnya animate membesar ke center, kamera sedikit mendekat, dan panel-panel lain pindah ke orbit baru mengelilingi planet (posisi dihitung melingkar, rotasinya jalan, scale-nya turun). Kalau kamu mau “buka halaman lain”, itu bisa berarti mengganti isi panel besar (konten berubah), atau benar-benar pindah “scene state” tapi tetap di galaksi yang sama supaya transisinya lembut.

Supaya semua ini jalan mulus, yang paling kamu butuhkan selain library adalah perencanaan struktur scene dan manajemen performa. Partikel bisa puluhan ribu tapi harus pakai BufferGeometry/InstancedMesh, jangan DOM. Shader harus dioptimasi, dan beberapa efek berat (bloom intens, lensing, noise resolusi tinggi) sebaiknya punya quality setting otomatis: di PC/high GPU full, di HP dikurangi jumlah partikel, turunin render scale, matiin lensing dulu tapi tetap kelihatan keren.

Kalau kamu mau, aku bisa bantu ngerapihin jadi “rencana implementasi” yang benar-benar nyambung dengan gambar Desain web kamu (ring mana isinya apa, panel jumlah berapa, interaksi apa aja, state apa aja, dan efek black hole level mana yang kamu mau: versi ringan dulu atau langsung yang lensing). Kamu juga bisa bilang kamu mau basisnya React (R3F) atau vanilla Three.js, karena itu nentuin cara kita ngatur UI panel dan “halaman lain” nanti.

Iya, bisa banget. Aku bikin rencana implementasi yang “nempel” ke gambar Desain web.png kamu, jadi kita ngomongnya bukan abstrak, tapi benar-benar: pusat POV di tengah, ada ring panel sistem melayang 360°, ada ring benda-benda galaksi, ada ring paling luar untuk bintang + 12 zodiac, lalu black hole jadi environment paling penting yang selalu jadi “anchor” visual dan rasa gravitasi di scene.

Aku akan anggap targetnya adalah pengalaman seperti video yang kamu kirim: transisi sinematik (bukan sekadar snap), UI terasa “hidup” (bukan layout 2D), dan interaksi jelas (bisa dipencet, bisa zoom panel, bisa masuk ke “halaman lain” tanpa kehilangan dunia 3D-nya).

## Konsep besar sesuai gambar kamu

Di gambar “Bentuk 3D webnya (dari POV atas)”, kamu sudah menentukan struktur dunia yang sebenarnya sangat cocok untuk web 3D: kamera/POV berada di pusat, lalu semua konten berada pada radius tertentu mengelilingi pusat itu. Ini penting karena dengan pola begini, rotasi 360° kerasa natural, panel-panel bisa jadi “satelit”, dan transisi fokus panel bisa dibuat seperti kamera mendekat dan panel maju, bukan “buka halaman biasa”.

Aku bagi dunia ini jadi empat lapisan utama yang persis dengan anotasi kamu.

Lapisan pusat adalah “POV rig” (kamera + kontrol), karena kamu mau bisa lihat 360° ke samping dan sedikit naik turun (pitch kecil). Ini bukan cuma kamera, tapi satu “rig” yang nanti juga bawa beberapa elemen dekat kamera seperti aura halus, UI yang nempel halus, serta logika transisi.

Lapisan cincin paling dekat (inner ring) adalah “panel sistem melayang” (kotak-kotak panel kecil 360°). Ini yang di gambar kamu disebut “Diisi sama panel sistem melayang”. Panel defaultnya kecil dan menyebar, lalu panel tertentu bisa “zoom in/out” ketika dipencet seperti sketsa kanan-tengah.

Lapisan cincin tengah (middle ring) adalah “benda-benda melayang di galaxy” (debu, pecahan, orb, asteroid kecil, serpihan cahaya). Ini yang bikin ruangnya terasa padat dan hidup walaupun panelnya UI.

Lapisan cincin jauh (outer ring) adalah “penampakan rasi bintang 12 zodiac + starfield jauh”. Ini bukan sekadar background statis; dia jadi horizon dunia. Zodiac bisa jadi label/glyph yang tampak jauh, pelan bergerak, dan ikut kena distorsi halus ketika dekat black hole.

Di samping struktur cincin itu, ada “black hole” yang kamu tandai sebagai environment paling penting. Secara visual kamu ingin black hole seperti gambar referensi (accretion disk terang, event horizon gelap, ada kesan lensing dan gerak partikel). Secara fungsi, black hole ini bukan cuma dekor, tapi “tulang punggung mood” dan pusat dramatis untuk transisi.

## Keputusan teknis yang paling mengunci

Karena kamu ingin transisi seperti video dan kamu juga ingin ada UI panel yang benar-benar bisa dipencet, paling enak dan scalable kalau kita pakai React + React Three Fiber (R3F) untuk 3D-nya. Kenapa? Karena state UI (panel mana yang aktif, mode planet navigation, mode search, mode fokus panel) jauh lebih rapi di React daripada Three.js vanilla. Kamu tetap bisa bikin rendering sekelas Active Theory karena yang menentukan kualitas itu shader, postprocessing, dan koreografi animasi, bukan “pakai React atau tidak”.

Di atas R3F, kamu butuh tiga “alat tempur” inti.

Yang pertama adalah postprocessing (bloom/glow, vignette, grain, depth-of-field halus kalau mau). Ini yang bikin accretion disk kamu “nyala” dan panel punya aura.

Yang kedua adalah sistem animasi timeline untuk transisi sinematik. Biasanya GSAP paling enak buat koreografi kamera + panel + partikel dalam satu timeline, karena kamu bisa bikin “gerak bareng” yang presisi.

Yang ketiga adalah sistem interaksi (raycasting) yang benar-benar bersih supaya panel itu jelas mana yang bisa diklik, mana yang cuma dekor, dan tidak ada “lapisan nindih” yang bikin tidak bisa pencet apa-apa. Ini penting banget karena kamu sebelumnya sempat ngalamin problem click ketutup layer.

Kalau stack ini diset dari awal, sisanya tinggal eksekusi detail.

## Struktur scene yang nyambung ke gambar kamu

Aku jelasin scene graph-nya dengan cara bayangin: “dunia” ini satu scene 3D, tapi secara logika dibagi beberapa grup besar.

Ada satu grup besar bernama WorldRoot. Di dalamnya ada CameraRig di pusat. Kamera sebenarnya tidak kamu gerakkan langsung; kamu gerakkan rig, supaya nanti lebih gampang bikin efek halus seperti “floating”, “inertia”, dan “pull UI saat pitch turun”.

Lalu ada BlackHoleSystem yang posisinya tidak harus di pusat. Di sketsa tampilan utama kamu, black hole terlihat di sisi kiri. Ini artinya, posisi black hole bagusnya berada pada radius tertentu dari pusat, di arah “kiri” relatif terhadap arah default kamera. Dengan begitu, pada pose default (landing), black hole langsung terlihat di kiri, panel-panel melayang di depan/samping, dan ketika user rotate 360° mereka bisa menemukan sudut lain tapi tetap tahu black hole itu anchor.

Kemudian ada PanelRingSystem yang mengitari pusat. Ini berisi banyak PanelNode kecil. PanelNode ini bukan cuma kotak; dia adalah entitas yang punya data: id, judul, jenis konten, “halaman” tujuan, radius default, sudut default, tinggi (y) default, dan skala default. Ini penting supaya nanti transisi fokus panel tidak asal, tapi punya target yang jelas.

Setelah itu ada GalaxyDebrisRing yang isinya benda-benda melayang (particle clouds, small meshes, streaks). Ini yang bikin ruangnya terasa “berisi”. Kamu bisa desain ring ini lebih besar daripada ring panel, jadi panel terasa seperti UI “di ruang” dan debris terasa seperti lingkungan.

Terakhir ada FarStarfieldZodiacRing yang sangat jauh. Ini bisa berupa starfield partikel besar yang “diam” relatif ke dunia (tapi tetap ada parallax kecil), lalu 12 zodiac sebagai sprite/glyph yang ditempatkan melingkar jauh dengan radius besar.

Dengan struktur ini, gambar top-view kamu kebangun persis: pusat POV, ring panel, ring objek, ring zodiac.

## Kontrol kamera sesuai catatan “360° samping + sedikit atas bawah”

Kamu butuh kontrol yang mirip orbit, tapi bukan orbit yang biasa “ngeliatin objek di tengah”. Karena pusatnya adalah POV (di tengah) dan dunia mengelilingi, kontrolnya lebih mirip “free look”: yaw 360° bebas, pitch dibatasi kecil (misalnya cuma bisa ngangguk sedikit naik turun). Zoom default sebaiknya dimatikan dulu supaya world scale konsisten, tapi nanti zoom dipakai khusus saat fokus panel atau fokus planet navigation, jadi user tidak bisa “ngacauin” jarak kamera.

Gerakan kamera harus punya rasa “mass”. Jadi ketika drag, kamera tidak berhenti mendadak, tapi ada inertia halus. Ini salah satu kunci feel “premium” seperti video.

Di mobile, gesture-nya tetap sama: drag untuk yaw/pitch, tap untuk select panel, pinch tidak perlu dipakai untuk zoom dunia (lebih baik dipakai untuk zoom panel kalau panel sudah fokus).

## Black hole sebagai environment paling penting

Black hole kamu harus terasa “hidup”, bukan gambar. Cara implementasi yang realistis untuk web adalah memecah black hole jadi beberapa komponen visual yang digabung.

Event horizon adalah sphere hitam pekat. Ini simple, tapi harus “benar-benar hitam” dan tidak kena lighting biasa supaya tidak abu-abu.

Accretion disk adalah mesh berbentuk ring/torus yang materialnya shader. Shader ini yang bikin pola garis-garis cahaya melingkar seperti referensi kamu. Di shader, tiap pixel dihitung berdasarkan jarak ke pusat, sudut (angle), dan waktu. Dari situ kamu bikin swirl, noise, streak, dan warna gradien. Ini yang bikin disk terlihat bergerak.

Jet atau streak “keluar” seperti di gambar bisa kamu buat sebagai partikel berbentuk garis (streak particles) atau mesh tipis transparan dengan noise. Ini opsional, tapi kalau kamu pasang halus, black hole langsung terasa “mahal”.

Gravitational lensing, kalau kamu mau yang benar-benar terasa, sebaiknya dilakukan sebagai distorsi background, bukan distorsi semuanya. Kenapa? Karena kalau kamu distorsi seluruh frame, panel UI juga ikut bengkok dan malah mengganggu usability. Jadi rencana yang paling aman adalah: render starfield + zodiac sebagai layer/background pass, distorsi layer itu di sekitar posisi black hole (screen-space), lalu render panel UI dan objek dekat kamera di atasnya tanpa distorsi. Hasilnya, bintang di belakang black hole terlihat melengkung, tapi panel UI tetap bersih.

Bloom/postprocessing harus dipakai buat accretion disk. Tanpa bloom, disk akan terlihat seperti tekstur biasa. Dengan bloom yang tepat, garis terang akan “menyebar” dan jadi aura.

Dan yang penting: black hole harus ikut “berinteraksi” dengan mood transisi. Saat kamu fokus ke panel, kamu bisa sedikit menurunkan intensitas disk atau mengubah kecepatan swirl supaya fokus user pindah ke panel. Saat balik ke mode bebas, intensitas normal lagi. Ini trik sinematik sederhana tapi efeknya besar.

## Panel sistem melayang 360° sesuai sketsa “panel kecil banyak melayang”

Di mode default (tampilan utama), panel-panel kecil harus terasa “mengorbit” dan “melayang”. Ini bisa kamu capai dengan posisi panel dihitung dari sudut + radius, lalu setiap panel punya offset kecil naik turun (y) yang pelan berubah (pakai noise/time). Jadi panel tidak statis.

Arah panel sebaiknya tidak 100% menghadap kamera seperti billboard, karena kalau semuanya selalu menghadap kamera, dunia jadi terasa “2D ditempel”. Lebih enak kalau panel punya orientasi dasar mengikuti ring (sedikit menghadap tangensial), tapi saat kursor mendekat atau saat panel akan dipilih, panel melakukan “turn” halus menghadap kamera. Ini bikin panel terasa punya “niat” dan hidup.

Untuk “apa yang bisa dipencet”, panel harus punya state hover. Di desktop, saat mouse hover panel, ada glow outline halus, skala naik sedikit, dan cursor berubah. Di mobile, hover tidak ada, jadi kamu kasih feedback saat tap down (panel sedikit “sink” lalu bounce). Ini yang menghilangkan kebingungan “INI SEBENARNYA APANYA YG BISA DI PENCET”.

Agar tidak ada layer nindih yang bikin semua tidak bisa diklik, panel dan objek interaktif harus dipisah jelas dari dekor. Dekor diberi flag “noRaycast” atau dimasukkan ke layer yang tidak dicek raycaster. Lalu UI DOM di atas canvas harus diatur pointer-events-nya ketat: hanya elemen yang memang perlu input yang boleh menangkap pointer, sisanya pointer-events: none.

## Mekanisme “zoom in/out salah satu panel” seperti sketsa kanan-tengah

Mode fokus panel itu harus terasa seperti transisi video: kamera bergerak, panel membesar, panel lain mengecil, semuanya tetap ada di ruang 3D.

Begini bentuk target-nya: ketika user tap/click panel A, panel A tidak sekadar scale up di tempat. Panel A bergerak menuju “focus anchor” di depan kamera (posisi fixed relatif kamera), lalu scale up sampai jadi panel besar seperti sketsa. Kamera bisa ikut sedikit maju atau bahkan hanya rotasi menghadap panel A, tergantung feel yang kamu mau. Panel-panel lain tidak hilang mendadak; mereka menjauh sedikit, scale turun, opacity turun, dan tetap mengorbit pelan di background. Ini persis “panel kecil jadi kecil dan berputar di sekitarnya” yang kamu tulis di sketsa planet navigation, tapi versi panel-focused.

Lalu saat user keluar (misalnya klik close atau klik area kosong), timeline dibalik: panel A kembali ke orbit semula, panel lain balik, kamera balik.

Secara implementasi, yang paling rapi adalah kamu punya state: ExploreMode dan FocusPanelMode. ExploreMode artinya kontrol kamera aktif dan panel di orbit. FocusPanelMode artinya kontrol kamera dikunci halus (atau tetap bisa yaw sedikit), panel aktif berada di anchor, dan panel lain jadi latar.

## Planet logo dua cincin sebagai navigasi sesuai sketsa kanan-bawah

Planet logo kamu bukan sekadar ikon; dia bisa jadi “mode switch” utama.

Di ExploreMode, planet logo bisa berada di salah satu slot ring panel atau dekat pusat ring (tergantung komposisi). Dia terlihat seperti planet dengan dua cincin, mungkin punya shader halus juga (glow tipis, highlight bergerak). Saat dipencet, kamu masuk PlanetNavMode.

Di PlanetNavMode, planet itu naik jadi pusat visual. Planet bergerak ke tengah layar dan membesar, cincin berputar lebih jelas. Panel-panel sistem yang tadinya menyebar 360° bisa “reformasi” jadi orbit yang lebih rapi mengelilingi planet. Ini cocok dengan catatan kamu: “Kalau dipencet, planet bakal jadi besar terus ke tengah sambil nanti semua panel jadi kecil dan berputar di sekitarnya.” Di mode ini, planet jadi hub, panel-panel jadi satelit, dan user bisa pilih satelit untuk masuk FocusPanelMode.

Ketika keluar PlanetNavMode, semuanya balik ke ExploreMode dengan transisi halus.

Perbedaan PlanetNavMode dan FocusPanelMode itu penting. PlanetNavMode itu reorganisasi UI besar-besaran (navigasi), sementara FocusPanelMode itu fokus ke satu konten.

## Search bar dan keyboard hologram sesuai sketsa kiri-bawah

Ini bagian yang paling “UI-illusion” dan bisa jadi ciri khas kamu.

Search bar di atas sebaiknya bukan DOM overlay biasa, tapi elemen 3D yang “dekat kamera”. Artinya, dia adalah plane tipis yang posisinya mengikuti kamera, tapi tidak benar-benar statis; dia punya spring/inertia, jadi ketika kamera yaw/pitch, bar sedikit tertinggal dan balik, bikin feel hologram.

Saat kamera pitch ke bawah (user “menunduk”), search bar tidak harus tetap di atas. Kamu bisa buat dia “ketarik turun” seperti kamu tulis “sambil narik kek panel search di atasnya”. Jadi makin menunduk, bar turun sedikit, makin jelas, makin reachable.

Keyboard hologram itu sebenarnya sudah ada dari awal di scene, tapi posisinya berada di bawah garis pandang normal. Jadi pada pitch normal, dia hampir tidak terlihat. Saat pitch turun melewati ambang tertentu, keyboard naik sedikit (atau kamera melihat area yang memang sudah ada keyboard), opacity keyboard naik, glow bertambah, dan sound/feedback halus (kalau kamu pakai audio) bikin terasa aktif.

Input text-nya tetap sebaiknya pakai input DOM asli (biar mobile gampang dan aksesibilitas aman), tapi visual keyboardnya 3D. Jadi user mengetik di input (bisa auto-focus ketika search aktif), lalu teks yang mereka ketik kamu tampilkan juga sebagai hologram di search bar (bisa pakai text di texture atau SDF text). Di desktop, kalau kamu benar-benar mau “klik tombol keyboard hologram”, itu bisa dibuat sebagai gimmick, tapi jangan jadi satu-satunya cara input, karena ribet dan berat. Lebih realistis: tombol hologram hanya untuk efek (animasi) dan beberapa shortcut (enter, backspace) kalau kamu mau.

Search fungsinya bisa memfilter panel. Jadi saat user mengetik, panel-panel yang match judul/tag akan glow dan yang tidak match opacity turun. Ini langsung bikin 3D UI terasa fungsional, bukan sekadar pajangan.

## “Halaman lain bisa dibuka” tanpa meninggalkan dunia 3D

Ini bagian yang sering bikin orang salah kaprah. Kalau kamu bikin web 3D seperti ini, “pindah halaman” paling bagus bukan reload page, tapi mengganti konten panel besar atau mengganti mode scene sambil tetap mempertahankan world.

Ada dua gaya.

Gaya pertama adalah panel sebagai “viewport konten”. Jadi saat panel di-zoom (FocusPanelMode), isi panel berubah menjadi halaman (misalnya About, Projects, Systems, Gallery). Ini seperti kamu membuka halaman, tapi masih di dalam panel. Keluar dari panel artinya kembali ke galaksi.

Gaya kedua adalah “scene chapter”. Misalnya panel tertentu kalau dibuka, kamera melakukan travel pendek ke area lain (masih satu universe), dan ring panel berubah jadi set baru. Ini lebih dramatis, tapi lebih banyak kerja.

Karena kamu pengin banyak interaksi dan ring panel 360°, biasanya gaya pertama lebih aman untuk versi awal, lalu nanti kalau sudah stabil kamu upgrade beberapa panel tertentu jadi “travel”.

Secara teknis, kamu tetap bisa pakai router (misalnya React Router) untuk sinkronisasi URL. Jadi saat panel A dibuka, URL jadi /system/a, saat keluar balik ke /. Ini berguna untuk share link, back button browser, dan SEO minimal. Tapi renderingnya tetap satu canvas.

## Transisi “kayak video” itu sebenarnya koreografi state + kamera + postFX

Biar kamu kebayang implementasinya tanpa ngomong step-by-step, aku jelasin “bahasa transisi”-nya: setiap perubahan state (Explore ↔ PlanetNav ↔ FocusPanel ↔ SearchFocus) harus punya timeline yang menggerakkan beberapa hal sekaligus: posisi kamera rig, rotasi rig, posisi panel aktif, skala panel aktif, opacity panel lain, kecepatan orbit panel lain, intensitas bloom, intensitas grain, dan kadang fokus depth-of-field.

Kuncinya adalah perubahan itu terjadi dengan easing sinematik, bukan linear. Dan semua properti itu bergerak bersama dalam durasi yang sama atau offset sedikit, supaya terasa “designed”.

Contoh feel yang cocok buat kamu: saat klik panel, panel mulai maju dulu 0.1 detik, baru kamera follow halus, lalu bloom naik sedikit di highlight panel, lalu panel lain mulai redup. Dengan offset kecil begini, mata user merasa ada kedalaman dan niat.

## Asset dan gaya visual yang konsisten dengan black hole

Karena black hole jadi pusat mood, gaya panel dan glyph zodiac harus “satu keluarga”. Panel sebaiknya punya material hologram: semi-transparan, ada noise halus, ada scanline tipis, ada edge glow. Jangan terlalu putih solid, nanti kalah sama black hole.

Zodiac jauh sebaiknya bukan teks biasa. Lebih enak kalau berupa glyph tipis, monochrome, agak pudar, dan terlihat jauh. Kalau perlu, setiap zodiac punya particle halo kecil.

Debris ring bisa meminjam bentuk dari accretion disk: partikel yang seolah tertarik, jadi arah geraknya ada bias ke black hole. Ini bikin semua elemen terasa “satu fisika”.

## Performa dan kualitas: versi PC dan versi mobile tetap keren

Agar ini benar-benar usable, kamu butuh strategi kualitas adaptif dari awal. Black hole shader + bloom + partikel ribuan itu bisa berat di HP. Jadi kamu definisikan kualitas berdasarkan device: resolusi render bisa diturunkan sedikit di mobile, jumlah partikel starfield dikurangi, lensing bisa dimatikan dulu di mobile tapi disk tetap cakep, bloom intensity tetap ada tapi threshold lebih ketat, motion blur jangan dulu.

Yang penting, walau efek dikurangi, komposisi dan transisi tetap terasa premium. Jadi jangan bergantung pada satu efek berat saja.

## Cara menghindari masalah “lapisan nindih” dan “nggak bisa pencet apa pun”

Masalah seperti ini biasanya terjadi karena dua hal: ada elemen DOM overlay yang menutupi canvas, atau semua objek di scene ikut kena raycast sehingga pointer event “ketangkap” objek tak terlihat.

Jadi dari desain arsitektur, kamu harus disiplin: semua dekor (starfield, debris, bahkan sebagian partikel black hole) tidak ikut raycasting. Raycasting hanya memeriksa panel interaktif dan tombol yang memang bisa diklik. Lalu UI DOM overlay dibuat seminimal mungkin, dan kalau ada, hanya area input yang pointer-events aktif.

Di R3F, event system sudah bantu, tapi kamu tetap harus memisahkan “interactive layer” dan “visual-only layer” supaya tidak ada perangkap invisible geometry.

## Rencana produksi konten panel (biar panel bukan kosong)

Panel kecil banyak itu enaknya punya kategori. Misalnya panel “System” berisi menu kecil, panel “Gallery” panel “Docs” panel “Contact” panel “Social” panel “Experiments”. Jadi ketika user muter 360°, mereka ketemu banyak titik interaksi. Kamu juga bisa pakai “featured panel” yang default posisinya lebih dekat ke arah depan (kotak kiri tengah di sketsa kamu), karena kamu bilang default panel besar itu asalnya dari posisi itu.

Panel besar saat zoom bisa punya subpanel kecil di sekitar (seperti sketsa kamu yang panel kecil ada di pinggir atas). Ini membuat “halaman” di dalam panel terasa kaya.

## Tahapan implementasi yang realistis tapi tetap nyambung ke desain kamu

Aku tidak akan bikin daftar langkah, tapi aku jelaskan jalur implementasi yang biasanya paling aman supaya hasilnya cepat “kerasa” tanpa kejebak detail terlalu awal.

Pertama kamu bangun dunia statis dulu sesuai top-view: camera rig di pusat dengan kontrol 360° dan pitch kecil, ring panel muncul sebagai kotak-kotak sederhana, starfield jauh, satu placeholder black hole. Tujuannya memastikan skala ruang, komposisi, dan kontrol kamera sudah enak.

Begitu ruang sudah enak, kamu masukkan interaksi panel: hover, tap, highlight, lalu kamu implement FocusPanelMode yang bisa zoom panel. Pada titik ini, walau black hole masih placeholder, kamu sudah bisa merasakan “ini beneran website 3D yang bisa dipakai”.

Setelah itu baru kamu upgrade black hole jadi “hero”: shader accretion disk, bloom, partikel, dan kalau mau, lensing background. Karena black hole ini berat, lebih aman masuk setelah sistem UI stabil.

Sesudah black hole jadi, kamu masuk ke PlanetNavMode dan Search+Keyboard hologram, karena dua fitur ini butuh integrasi dengan state dan animasi.

Terakhir, kamu poles transisi seperti video: timeline yang halus, postprocessing yang pas, dan micro-interaction (inertia, drift, glow).

Jalur ini bikin kamu cepat punya versi yang sudah bisa dipakai, lalu kualitasnya naik bertahap.

## Spesifikasi detail tiap mode (biar jelas “ngapain saat apa”)

ExploreMode adalah kondisi default sesuai sketsa “Tampilan utama (bisa geser kanan kiri 360°)”. Di mode ini, kamera bebas yaw 360°, pitch sedikit, panel orbit pelan, black hole terlihat sebagai anchor di sisi tertentu, starfield jauh stabil, UI search bar ada di atas tapi tidak terlalu dominan, keyboard hologram hampir tidak terlihat kecuali kamu menunduk.

SearchFocusMode aktif ketika user klik search bar atau ketika kamera menunduk melewati ambang dan user “ingin mengetik”. Di mode ini, search bar turun sedikit dan jadi lebih jelas, keyboard hologram jadi terang, panel-panel yang match query jadi glow dan posisinya bisa sedikit “menghadap” kamera.

PlanetNavMode aktif ketika user menekan planet logo cincin. Di mode ini, planet jadi pusat visual, panel-panel reorganisasi jadi orbit rapi mengelilingi planet, kamera menghadap planet, kontrol kamera lebih terbatas supaya tidak bikin pusing.

FocusPanelMode aktif ketika user memilih satu panel. Di mode ini, panel aktif maju ke anchor dan membesar, panel lain jadi latar yang mengecil dan mengorbit, kamera dikunci halus, dan konten “halaman lain” tampil di panel besar.

Mode-mode ini yang membuat website kamu terasa seperti produk, bukan demo.

## Apa yang perlu kamu siapkan dari sisi desain konten

Agar implementasi lancar, kamu butuh definisi minimal: daftar panel apa saja (nama, ikon, fungsi), panel mana yang “default dekat depan” (kotak kiri tengah yang kamu sebut), panel mana yang punya subpanel, dan konten tiap panel besar kira-kira apa. Tidak harus detail final, tapi minimal ada struktur.

Untuk zodiac, kamu butuh aset glyph atau setidaknya nama 12 zodiac yang mau ditampilkan dan style-nya (misalnya hanya simbol, tanpa teks). Untuk planet logo, kamu butuh style final (warna, glow, material).

Untuk black hole, kamu sudah punya referensi gambar. Yang penting kamu tentukan target “level” dari awal: mau cukup disk + bloom + partikel, atau mau sampai lensing background. Ini menentukan durasi pengerjaan shader dan postprocessing.

## Kalau kamu setuju, aku bisa bikin “blueprint angka” yang lebih teknis dan presisi

Kalau kamu mau, aku bisa lanjutkan rencana ini jadi blueprint yang benar-benar siap dijadikan backlog coding, tapi tetap dalam bentuk deskriptif: ukuran radius tiap ring (misal inner ring radius sekian, debris ring sekian, zodiac ring sekian), jumlah panel ideal, jumlah partikel starfield, batas pitch kamera, aturan easing transisi, dan aturan posisi black hole relatif ke kamera default supaya komposisinya persis seperti sketsa tampilan utama kamu.

Kamu tinggal jawab satu hal saja (tanpa perlu panjang): kamu lebih pengin black hole itu selalu terlihat di kiri pada tampilan default (seperti sketsa), atau black hole itu “objek yang ditemukan saat muter 360°” (jadi landing-nya bisa menghadap panel dulu baru black hole belakangan). Ini cuma menentukan orientasi awal dan posisi black hole relatif ring panel.

Sip. Aku bikin blueprint yang benar-benar “ngunci” ke desain kamu: POV di pusat, ring panel 360°, ring benda galaksi, ring zodiac jauh, dan black hole selalu nongol sedikit di kiri pada landing (cuma “sebagian kecil”), lalu makin jelas kalau kamera diputar ke kiri. Aku juga set supaya zodiac secara komposisi ada di sisi yang tidak ketutup black hole, bahkan saat kamu putar kamera untuk ngejelasin black hole.

Aku akan tulis ini sebagai blueprint produksi: angka-angka radius, sudut, ukuran, batas kamera, aturan distribusi panel, aturan transisi, aturan layering render, dan struktur data supaya nanti waktu coding kamu tinggal “isi” bukan ngarang ulang.

---

## Skala dunia, sumbu koordinat, dan aturan komposisi landing

Agar semua konsisten, pakai koordinat standar Three.js: Y ke atas, X ke kanan, Z ke depan. Kamera/POV rig berada di (0, 0, 0) dan arah “default melihat” adalah ke +Z (yaw = 0). Semua angka di bawah anggap 1 unit = 1 meter (boleh kamu anggap unit arbitrer, yang penting konsisten).

Komposisi landing yang kamu minta bisa dicapai kalau black hole ditempatkan “kiri-depan” relatif kamera, tapi tidak tepat di depan. Artinya, pada yaw = 0, black hole masuk frame di sisi kiri dan sebagian terpotong (atau minimal berada dekat edge), sehingga terlihat “ada sesuatu di semesta”, tapi belum jadi fokus. Lalu ketika user yaw ke kiri, black hole bergerak ke tengah frame dan baru kelihatan jelas bentuknya.

Secara angka yang enak untuk ini: tempatkan black hole pada jarak sekitar 22–28 unit dari origin, dengan azimuth sekitar -55° sampai -75° dari arah +Z. Dalam koordinat, ini kira-kira posisi seperti x negatif dan z positif, contohnya x ≈ -18, z ≈ +18 (jarak ~25). Ukuran visual black hole (radius disk) nanti dibuat cukup besar supaya ketika sudah “centered” terlihat megah, tapi pada landing hanya kebagian “sayap” disk di kiri.

Zodiac kamu mau “ada di sisi yang gak ketutup black hole”. Cara paling stabil bukan memaksa zodiac tidak pernah berada di belakang black hole (karena kamu bisa rotasi 360°), tapi memastikan pada sudut-sudut penting: landing (yaw 0) dan “reveal black hole” (yaw ke kiri), zodiac yang ditonjolkan selalu muncul di sisi kanan/atas, lalu zodiac yang posisinya berpotensi tertutup black hole otomatis memudar halus. Jadi secara komposisi, user selalu merasa zodiac “berlawanan sisi” dengan black hole.

---

## Blueprint radius ring sesuai sketsa top-view kamu

Di sketsa kamu ada 3 lapisan cincin. Aku bikin parameter ring yang realistis untuk web dan enak secara parallax.

Ring panel sistem (inner ring) berada dekat pusat karena itu yang interaktif. Radius idealnya 8.5 sampai 12 unit dari origin. Panel kecil jumlahnya enak di 10–18 item untuk tahap awal; kalau kamu paksa 30+ dari awal, kamu akan habis waktu di usability dan performance.

Ring benda galaksi (middle ring) berada di radius 16 sampai 26 unit. Ini berisi debris, partikel, shard, glints, dan “pengisi ruang” yang membuat semesta hidup. Ring ini boleh “melebar” karena benda-benda ini tidak semuanya harus jadi satu garis lingkaran; bisa jadi volume torus.

Ring zodiac + starfield jauh (outer ring) berada sangat jauh, radius 90 sampai 160 unit. Biar terasa jauh, zodiac ditempatkan pada jarak yang jauh dan ukurannya kecil, sementara starfield memakai dome/sphere yang bahkan lebih jauh (bisa radius 200–300) supaya bintang tidak “ikut bergerak” terlalu banyak saat kamera pitch.

Kamu akan dapet rasa kedalaman begini: panel terasa dekat (bisa disentuh), debris terasa di ruang medium (menambah atmosfer), zodiac terasa horizon jauh (seperti rasi bintang di langit).

---

## Struktur scene graph yang langsung bisa kamu jadikan kerangka project

Bayangin scene kamu dibagi jadi beberapa group besar. Ini penting supaya animasi dan raycast gampang dikontrol.

Ada WorldRoot sebagai induk semua.

Di dalamnya ada CameraRig. Kamera bukan berdiri sendiri; kamera menempel ke rig. Rig ini punya dua tingkat: RigYaw untuk rotasi horizontal (yaw 360°) dan RigPitch untuk rotasi vertikal kecil. Kamera berada sebagai anak dari RigPitch. Dengan struktur ini, kamu bisa bikin batas pitch tanpa merusak yaw, dan kamu bisa bikin inertia/spring lebih gampang.

Lalu ada BackgroundLayer yang berisi StarfieldDome dan ZodiacRing. Ini layer visual jauh.

Lalu ada MidLayer yang berisi GalaxyDebrisVolume.

Lalu ada UILayer3D yang berisi PanelRingSystem, PlanetHub, SearchBarHolo (yang ngikut kamera), dan KeyboardHolo (yang reveal saat menunduk).

Lalu ada BlackHoleLayer yang berisi BlackHoleSystem. Walau secara jarak black hole ada di medium, secara artistik dia “hero”, jadi dia sering lebih enak dipisah group sendiri agar kamu bisa atur bloom, lensing, dan kualitas tanpa mengganggu UI.

Yang paling penting adalah memisahkan “interactive objects” dan “visual-only objects” sejak awal. Jadi Panel meshes dan tombol tertentu masuk ke InteractiveLayer (untuk raycast), sementara debris, starfield, sebagian besar partikel black hole masuk ke VisualOnlyLayer (raycast di-skip). Ini menghindari tragedi “ada lapisan nindih jadi gak bisa klik”.

---

## Kamera dan kontrol: 360° nyaman, pitch kecil, dan reveal black hole terasa sinematik

Kamu ingin user bisa lihat 360° ke samping, dan naik-turun sedikit. Berarti yaw bebas (0 sampai 360°), pitch dibatasi misalnya dari -25° sampai +12°. Batas ini bikin user bisa “menunduk” untuk melihat keyboard hologram, tapi tidak bisa membalik kamera sampai bikin pusing.

Kamu juga butuh inertia. Jadi ketika user drag mouse, yaw dan pitch bergerak dengan smoothing. Secara feel, target yang bagus: input langsung, tapi posisi rig menyusul 120–220 ms. Ini “rasa berat” ala cinematic.

Zoom dunia sebaiknya tidak user-kontrol di ExploreMode. Zoom dipakai khusus untuk fokus panel atau mode planet. Di mobile, pinch bisa kamu gunakan untuk zoom panel ketika panel sudah masuk FocusPanelMode, bukan untuk zoom dunia.

Untuk “black hole selalu terlihat sedikit di kiri” pada landing, set yaw awal = 0 menghadap +Z, dan posisikan black hole di azimuth negatif seperti tadi. Lalu kamu atur FOV kamera sekitar 45–55 derajat (tergantung target layar). FOV terlalu lebar bikin black hole terlalu kelihatan dari awal; FOV terlalu sempit bikin user tidak merasa “semesta”. Biasanya 50° adalah sweet spot.

---

## BlackHoleSystem: komponen visual, kualitas, dan aturan “cuma sedikit terlihat di kiri”

Black hole kamu bukan satu mesh. Dia adalah sistem.

Event horizon dibuat sebagai sphere hitam pekat (material unlit). Ini harus benar-benar hitam, tidak menerima light, supaya tidak jadi abu-abu.

Accretion disk dibuat sebagai ring/torus tipis yang punya shader. Shader-nya menghasilkan swirl berdasarkan polar coordinates: radius dan angle. Kamu memodulasi brightness dengan noise dan time sehingga terasa “mengalir”. Kamu juga bikin gradien warna dari putih ke hangat (kuning-oranye) di bagian paling terang, lalu memudar ke biru/abu di outer disk kalau mau.

Jet/streak (yang terlihat seperti semburan) kamu bisa bikin sebagai partikel garis (stretched sprites) atau beberapa mesh transparan memanjang dengan noise. Ini tidak harus kuat; cukup halus untuk memberi “energi”.

Lensing adalah opsi paling mahal, tapi kamu bisa bikin versi yang aman: lensing hanya mempengaruhi background starfield/zodiac, bukan mempengaruhi panel UI. Ini penting agar UI tidak bengkok.

Aturan “black hole hanya sedikit terlihat di kiri pada landing” kamu capai dengan kombinasi posisi dan ukuran. Disk radius visual bisa sekitar 6.5 sampai 9 unit. Kalau black hole berada 25 unit dari kamera pada azimuth -65°, maka pada yaw 0 disk hanya masuk frame bagian sayap kiri. Ketika user yaw ke -35° sampai -55°, black hole mulai masuk tengah dan terlihat jelas.

Kamu juga bisa menambah efek reveal halus tanpa terlihat curang: ketika sudut pandang mendekati black hole (delta yaw kecil terhadap arah black hole), intensitas disk sedikit naik, bloom naik, dan partikel sekitar black hole sedikit lebih ramai. Jadi user merasa “oh ini memang fokusnya”.

---

## Zodiac dan starfield: terlihat jauh, tidak ketutup black hole, dan tetap konsisten 360°

Starfield yang paling aman adalah sky-dome (sphere besar) dengan point sprites atau texture procedural. Ini membuat bintang selalu terasa “jauh banget”. Starfield sebaiknya dipengaruhi sedikit parallax saat yaw, tapi jangan terlalu besar.

Zodiac kamu letakkan pada ring jauh, tapi bukan ring datar biasa. Biar zodiac “ada di sisi yang gak ketutup black hole”, kamu buat zodiac ring agak miring (tilt) dan kamu set “zona penonjolan” di sisi kanan relative kamera default.

Secara placement, zodiac 12 item bisa tetap melingkar, tetapi kamu beri aturan opacity berdasarkan dua hal: sudut relatif terhadap arah black hole, dan apakah zodiac sedang berada di area yang secara layar dekat dengan black hole. Jadi jika zodiac sedang “berdekatan” secara sudut dengan black hole, glyph-nya memudar halus. Ini bukan menghilangkan zodiac dari semesta, tapi secara komposisi memastikan zodiac yang terlihat dominan selalu berada di sisi yang bersih.

Kesan “rasi bintang jauh” akan lebih kuat kalau zodiac bukan teks. Pakai glyph tipis (sprite) dengan glow kecil, opacity rendah, dan sedikit “twinkle” lambat. Ukurannya kecil, misalnya 1.5–2.5 unit, ditempatkan di radius 120–150. Dengan jarak sejauh itu, dia akan terasa seperti langit, bukan signage UI.

---

## PanelRingSystem: jumlah panel, posisi default, panel unggulan, dan perilaku orbit

Panel sistem melayang 360° adalah UI utama kamu. Panel ini harus konsisten, sehingga sebaiknya di-drive oleh data.

Secara geometri, panel adalah plane dengan rounded corners (bisa mesh + alpha texture, atau shader untuk rounded mask). Material panel sebaiknya hologram: sedikit transparan, ada noise halus, edge glow, dan highlight saat hover.

Distribusi panel di ring: radius base sekitar 10.2 unit. Setiap panel punya azimuth sendiri. Panel bisa tersebar merata 360°, tapi agar pengalaman terasa “designed”, kamu bikin beberapa panel cluster di depan (arah +Z) karena itu yang user pertama lihat. Panel lain tetap ada di belakang kiri-kanan untuk eksplorasi 360°.

Kamu bilang “defaultnya ada di kotak kiri tengah” dan panel besar berasal dari sana. Itu berarti satu panel unggulan (“featured panel”) diletakkan dekat depan-kiri sedikit (bukan kiri black hole, tapi kiri dari area panel). Misalnya azimuth sekitar -10° sampai -20° dari +Z, radius sedikit lebih dekat (9.2–9.8), dan scale sedikit lebih besar daripada panel lain. Ini membuat user langsung punya titik interaksi yang jelas, tanpa harus bingung “yang bisa dipencet yang mana”.

Panel lain yang kecil tetap melayang. Gerak melayang dibuat dengan offset Y halus berbasis time, plus rotasi micro wobble kecil. Jangan terlalu banyak wobble, nanti bikin pusing.

Arah panel: defaultnya tidak perlu selalu menghadap kamera. Biar terasa 3D, panel punya orientasi ring (sedikit tangensial). Tapi saat hover atau saat panel masuk fokus, panel menghadap kamera dengan easing.

---

## FocusPanelMode: panel zoom-in seperti sketsa kanan-tengah, tanpa menghilangkan semesta

Saat panel dipencet, panel itu tidak sekadar membesar di tempat. Dia “keluar dari orbit” dan menuju FocusAnchor yang berada di depan kamera.

FocusAnchor adalah posisi relatif kamera, misalnya (0.0, 0.1, -4.2) di ruang kamera. Artinya panel besar akan muncul “mengambang” sedikit di depan mata user, bukan jauh di dunia. Ini membuat UI terbaca dan nyaman.

Ketika panel aktif menuju anchor, panel lain tidak menghilang. Mereka menjauh sedikit, scale turun, dan opacity turun. Mereka bisa tetap mengorbit lambat sebagai latar.

Kamera pada FocusPanelMode dikunci halus: yaw masih boleh sedikit (misalnya ±10°) hanya untuk memberi rasa ruang, tapi tidak boleh bebas 360° karena nanti user kehilangan panel.

Panel besar bisa punya subpanel kecil di atas atau samping (seperti sketsa kamu yang ada kotak kecil di pinggir atas). Subpanel itu tetap 3D, tapi posisinya relatif panel besar, jadi gampang diatur layout-nya.

Keluar dari FocusPanelMode dilakukan dengan tombol close di panel, atau klik area kosong. Transisinya dibalik, panel kembali ke orbit, panel lain kembali normal.

---

## PlanetHubMode: planet dua cincin sebagai navigasi, panel jadi satelit

Planet logo dua cincin kamu jadikan “hub navigasi”. Dia berada di ring panel, tapi posisinya khusus supaya mudah ditemukan. Biasanya enak diletakkan di depan-kanan sedikit agar komposisi landing seimbang: black hole di kiri, planet hub di kanan, panel featured di depan-kiri.

Saat planet dipencet, kamu masuk PlanetHubMode. Planet bergerak ke tengah dan membesar, cincin berputar lebih jelas. Panel-panel lain mengecil dan berpindah ke orbit yang mengelilingi planet (bukan lagi mengelilingi origin). Ini cocok dengan konsep kamu: planet jadi besar di tengah, panel jadi kecil mengorbit di sekitarnya.

Mode ini adalah “mode navigasi”. User pilih panel satelit untuk masuk FocusPanelMode. Jadi PlanetHubMode adalah langkah sebelum fokus konten, bukan konten itu sendiri.

---

## Search bar dan keyboard hologram: selalu ada, tapi baru “kerasa” saat menunduk

Search bar hologram kamu posisikan dekat kamera, supaya terasa seperti HUD 3D, bukan overlay 2D.

Search bar normalnya ada di atas (sesuai sketsa), tapi tidak terlalu dominan. Ketika kamera pitch turun (menunduk), search bar tertarik turun sedikit dan membesar halus, seolah ikut “jatuh” ke area keyboard.

Keyboard hologram berada di bawah bidang pandang normal. Pada pitch normal, dia ada tapi hampir tidak terlihat (opacity rendah). Saat pitch melewati ambang, keyboard jadi jelas: opacity naik, glow naik, dan muncul sedikit animasi scanline.

Untuk input, yang paling aman tetap pakai input DOM asli (biar mobile dan IME aman), tapi visualnya tetap 3D. Artinya ketika search aktif, kamu fokuskan input DOM (bisa transparan), lalu teks yang diketik kamu render ke search bar 3D. Efeknya user merasa mengetik di hologram, tapi secara teknis tetap stabil.

Search bisa memfilter panel. Panel yang match query mendapat glow dan bisa pelan “menghadap” kamera. Panel yang tidak match opacity turun, tapi jangan hilang total agar semesta tetap terasa penuh.

---

## State machine yang kamu butuhkan agar transisi “kayak video” tidak berantakan

Supaya transisi benar-benar sinematik dan tidak saling tabrak, kamu butuh state global yang jelas.

Ada Explore sebagai default.

Ada FocusPanel saat panel dibuka.

Ada PlanetHub saat planet navigasi aktif.

Ada SearchFocus saat user fokus ke search (biasanya kombinasi kondisi: search aktif atau pitch menunduk melewati ambang, plus user melakukan interaksi).

Yang membuat video terasa “Active Theory” adalah bukan state-nya, tapi koreografi perpindahan antar state. Setiap perpindahan menggerakkan banyak properti sekaligus: posisi panel, skala panel, opacity panel lain, batas kamera, intensitas bloom, dan intensitas partikel di sekitar black hole.

Durasi transisi yang biasanya terasa premium adalah sekitar 0.6–1.1 detik tergantung event. Masuk focus panel enaknya 0.85 detik. Keluar focus panel 0.65 detik. Masuk PlanetHub 0.95 detik. Keluar PlanetHub 0.75 detik. Perubahan search/keyboard lebih cepat, sekitar 0.25–0.45 detik karena itu micro-interaction.

---

## Render pipeline: cara bikin black hole “mahal” tanpa merusak UI

Agar lensing tidak mengganggu panel, kamu perlakukan background sebagai pass terpisah.

Pertama render starfield + zodiac ke buffer. Kedua jalankan distorsi lensing di sekitar proyeksi black hole (screen-space), sehingga bintang di belakangnya terlihat melengkung. Ketiga render dunia mid-layer (debris). Keempat render black hole disk + horizon. Kelima render panel UI 3D dan HUD (search bar, keyboard). Lalu terakhir jalankan postprocessing global seperti bloom dan vignette, dengan pengaturan yang menjaga teks UI tetap terbaca.

Bloom sebaiknya dominan di accretion disk dan edge glow panel, tapi tidak boleh membuat panel jadi blur. Jadi threshold bloom perlu ketat: hanya bagian yang sangat terang yang mekar.

Tone mapping dan color management juga penting. Kalau kamu ingin look cinematic, gunakan tone mapping yang halus dan atur exposure agar black hole tetap kontras sementara panel tetap jelas.

---

## Interaksi dan raycast: blueprint anti “gak bisa pencet apa pun”

Semua objek yang bisa diklik harus masuk “InteractiveLayer” dan hanya layer itu yang diperiksa raycaster. Objek dekor tidak boleh ikut raycast, bahkan kalau mereka transparan atau partikel, karena itu sering jadi penyebab click ketangkap hal yang tidak terlihat.

Jika kamu punya DOM overlay untuk teks atau input, pastikan sebagian besar overlay menggunakan pointer-events: none, dan hanya input field yang pointer-events: auto. Dengan aturan ini, user bisa drag kamera dan klik panel tanpa tertutup overlay.

Hover desktop harus jelas: glow, scale, dan perubahan cursor. Tap mobile harus punya feedback: panel sedikit “press” lalu bounce.

---

## Parameter numerik final yang bisa kamu pakai sebagai “angka awal” project

Kamera: position (0, 0.2, 0) di rig, FOV 50°, near 0.1, far 350.

Batas pitch: dari -24° sampai +12°. Yaw bebas 360°.

Ring panel: radius base 10.2, variasi radius ±1.2, jumlah panel awal 14, tinggi panel base sekitar y = 0.2, bobbing amplitude 0.25, bobbing speed rendah.

Featured panel: azimuth sekitar -15° dari +Z, radius 9.6, scale 1.15 dibanding panel lain.

Planet hub: azimuth sekitar +25° dari +Z, radius 10.0, scale 1.1.

Black hole: posisi sekitar (-18, 0.1, 18), disk radius visual 7.5, horizon radius 2.2. Ini membuat black hole terlihat sebagian di kiri pada yaw 0, dan makin jelas saat yaw ke kiri.

Debris volume: radius 18–26, jumlah instanced meshes kecil 200–600, partikel debu 8k–20k tergantung device.

Zodiac ring: radius 130, tilt sekitar 18° ke atas, ukuran glyph 2.0, opacity rendah, twinkle lambat.

Aturan “zodiac tidak ketutup black hole”: opacity zodiac turun halus jika sudut zodiac mendekati arah black hole, dan penonjolan zodiac dibuat di sisi kanan/atas pada landing.

---

## Struktur data panel agar “halaman lain bisa dibuka” tanpa meninggalkan dunia

Setiap panel punya definisi data. Minimalnya: id, title, type, icon, orbitAzimuth, orbitRadius, orbitHeight, featuredWeight, route, contentSpec.

Saat panel dibuka, route bisa berubah (misalnya /system/abc), tapi canvas tidak reload. Konten panel besar ditentukan oleh contentSpec. Ini bisa berupa komponen React yang dirender ke texture (kalau kamu mau full 3D), atau HTML overlay yang diposisikan mengikuti panel (kalau kamu mau teks super tajam). Dua-duanya bisa, tapi untuk awal biasanya HTML overlay lebih cepat jadi.

---

## Kualitas adaptif: tetap keren di HP tanpa mematikan identitas visual

Di desktop kamu bisa nyalakan bloom lebih kuat, partikel lebih banyak, dan lensing aktif.

Di mobile, kamu turunkan render resolution sedikit (dynamic pixel ratio), kurangi partikel, dan bisa matikan lensing dulu. Disk shader tetap jalan, tapi noise detail dikurangi. Panel tetap punya glow, tapi lebih hemat.

Yang penting, walau kualitas turun, komposisi dan koreografi transisi tetap sama. Jadi pengalaman “Active Theory vibe”-nya tidak hilang.

---

## Checklist “rasa sesuai sketsa kamu” (sebagai acuan validasi hasil)

Pada landing, black hole harus terlihat sedikit di kiri, tidak dominan, tapi jelas “ada sesuatu”. Jika user yaw ke kiri, black hole harus “ketemu” dan jadi jelas, dengan bloom yang memuaskan dan swirl yang hidup.

Pada landing, area kanan/atas harus terasa “luas”, dan zodiac terasa di sisi yang bersih, tidak ketutup oleh black hole.

Panel harus jelas bisa dipencet. Minimal ada featured panel dekat depan, sehingga user tidak bingung.

Saat panel dipencet, panel harus maju ke depan kamera dan membesar, panel lain mengecil dan tetap ada di semesta, transisi halus seperti video.

Saat user menunduk, keyboard hologram baru “muncul”, dan search bar ketarik turun, terasa nyambung.

---

Oke, ini aku kunci jadi blueprint penempatan panel yang konkret (total 14 panel), nyambung ke top-view kamu, nyambung ke komposisi landing (black hole kecil di kiri), dan nyambung ke cara transisinya biar terasa “video”.

Supaya kita ngomongnya sama, aku pakai definisi arah seperti ini: kamera default menghadap ke depan (+Z). Sudut azimuth 0° artinya “tepat di depan”. Sudut positif bergerak ke kanan (misalnya +90° itu kanan), sudut negatif ke kiri (misalnya -90° itu kiri). Kamera bisa yaw 360° dan pitch kecil, tapi landing selalu mulai yaw 0°.

Black hole kamu sudah kita set sebagai anchor “kiri-depan” di sekitar azimuth -65° pada jarak jauh (sekitar 25 unit). Targetnya, pada landing yaw 0°, black hole cuma “nyembul” di pinggir kiri frame, bukan mendominasi. Begitu user geser ke kiri (yaw mendekati -35° sampai -65°), barulah black hole masuk lebih tengah dan bentuknya jelas.

Yang bikin ini berhasil adalah panel-panel tidak boleh “nutupin” black hole karena panel ada di ring dekat (radius sekitar 10). Jadi blueprint panel di bawah sengaja bikin area kiri-depan (sekitar -95° sampai -35°) lebih “longgar” dan panel yang kebetulan ada di zona itu otomatis punya aturan menghindar (aku jelasin di bagian “BH safe cone”).

Sekarang, panel sistem yang kamu mau ada 8 tema inti: Game, Project, Team, Docs, Gallery, Media, News, Contact. Aku tambahkan 6 panel ekstra yang biasanya bikin web studio terasa “hidup” dan masuk akal dalam semesta: About, Careers, Community, Support, Roadmap, Status. Total jadi 14 panel—pas untuk ring 360° tanpa terlalu rame, tapi tetap terasa kaya.

Di bawah ini penempatan konkretnya. Angka radius/height/scale ini bukan “hukum alam”, tapi angka awal yang biasanya langsung terasa enak begitu kamu render. Nanti kamu bisa fine-tune 5–10% tanpa merusak komposisi.

| Panel                    | Fungsi cepat di landing         | Azimuth | Radius | Height (Y) | Scale | Route / aksi                        |
| ------------------------ | ------------------------------- | ------: | -----: | ---------: | ----: | ----------------------------------- |
| Game                     | “CTA utama” (featured)          |    -15° |    9.6 |       0.28 |  1.15 | `/game` (preview + tombol “Launch”) |
| Project                  | pintu ke daftar project         |     +5° |   10.0 |       0.22 |  1.05 | `/projects`                         |
| Gallery                  | showcase visual (image-first)   |    +25° |   10.3 |       0.18 |  1.00 | `/gallery`                          |
| Planet Hub (bukan panel) | ikon planet 2 cincin (nav mode) |    +40° |    9.4 |       0.35 |  1.15 | masuk `PlanetHubMode`               |
| Media                    | video/teaser/press kit          |    +55° |   10.6 |       0.16 |  0.98 | `/media`                            |
| News                     | update singkat + ticker         |    +85° |   10.8 |       0.18 |  1.00 | `/news`                             |
| Team                     | profil tim (lebih “human”)      |   +115° |   10.7 |       0.22 |  0.98 | `/team`                             |
| Contact                  | CTA komunikasi (tegas)          |   +135° |   10.4 |       0.25 |  1.02 | `/contact`                          |
| Status                   | status layanan / uptime / build |   +155° |   10.9 |       0.18 |  0.95 | `/status`                           |
| About                    | lore studio / visi / brand      |   +175° |   11.2 |       0.20 |  0.95 | `/about`                            |
| Community                | Discord/komunitas               |   -155° |   11.0 |       0.18 |  0.95 | `/community`                        |
| Careers                  | rekrutmen / join                |   -130° |   10.8 |       0.22 |  0.95 | `/careers`                          |
| Roadmap                  | timeline rilis / milestone      |   -110° |   10.6 |       0.20 |  0.95 | `/roadmap`                          |
| Support                  | bantuan / FAQ / report bug      |    -90° |   10.9 |       0.16 |  0.92 | `/support`                          |
| Docs                     | dokumentasi (produk/tech)       |    -45° |   10.4 |       0.22 |  1.00 | `/docs`                             |

Kamu bakal notice: panel-panel “inti yang harus cepat ketemu” dikumpulkan di depan sampai kanan-depan (sekitar -15° sampai +135°). Ini sesuai sketsa kamu yang tampilan utama menampilkan beberapa panel sekaligus. Panel tambahan (About/Careers/Community/Roadmap/Support/Status) sengaja ditempatkan di belakang/kiri-belakang agar tetap ada saat eksplorasi 360° tapi tidak mengganggu first impression.

Planet hub aku taruh di +40° di sela-sela Gallery (+25°) dan Media (+55°), jadi di landing sisi kanan kamu punya “ikon planet” yang mengundang mode navigasi. Di sisi kiri, black hole “ngintip”. Ini menciptakan keseimbangan yang kamu minta: black hole jadi rasa semesta, planet jadi rasa navigasi, panel featured jadi rasa “ini bisa dipakai”.

Sekarang bagian paling penting supaya black hole tidak ketutup panel dan zodiac tidak terasa tertindih.

BH safe cone adalah zona sudut di sekitar arah black hole. Karena black hole berada kira-kira di -65°, zona yang rawan menutup black hole itu sekitar -95° sampai -35°. Panel yang azimuthnya masuk zona itu (misalnya Docs di -45°, Support di -90°) perlu aturan otomatis: ketika black hole sedang berada di dalam frustum kamera dan sudut pandang user mendekati arah black hole, panel-panel di BH cone ini tidak boleh duduk “di depan” black hole secara visual. Caranya bukan memindahkan permanen, tapi dinamika halus yang terasa natural: panel itu sedikit terdorong menjauh (radius +1.0 sampai +1.6), naik sedikit (Y +0.25 sampai +0.45), dan opacities-nya turun sedikit (misalnya ke 0.55–0.75) selama black hole sedang “di-reveal”. Hasilnya, user tetap melihat panel-panel itu ada di semesta, tapi black hole tidak pernah tertutup.

Zodiac visibility cone kamu set berlawanan: zona highlight untuk zodiac berada di sisi kanan sampai kanan-belakang (sekitar +20° sampai +160°). Jadi pada landing, mata user akan menangkap “ada zodiac di jauh sana” di area yang bersih, bukan di sisi black hole. Secara artistik kamu juga bisa bikin aturan kebalikan BH cone: zodiac yang kebetulan berada dekat arah black hole dibuat lebih redup sementara zodiac di sisi highlight dibuat sedikit lebih terang, jadi komposisi selalu terasa “zodiac ada di sisi yang tidak ketutup”.

Sekarang, bagaimana rasanya di landing dan ketika user geser kamera.

Pada landing (yaw 0°), yang paling dekat ke center frame adalah Game (-15°) dan Project (+5°). Gallery (+25°) dan planet hub (+40°) ada di kanan dan terlihat sebagai “navigasi berikutnya”. Black hole terlihat sedikit di pinggir kiri karena posisinya jauh dan berada di -65°. Docs (-45° masih terlihat tapi tidak dominan), dan panel lainnya membentuk arc yang terasa “melengkung” seperti ruang 3D. Pada kondisi ini, zodiac yang highlight ada di kanan-atas dan kanan-jauh, sehingga user merasa semesta itu luas, bukan sekadar UI.

Begitu user geser ke kiri (yaw menuju -30° sampai -65°), black hole mulai masuk lebih jelas. Pada saat yang sama, BH safe cone aktif: Docs (-45°) dan Support (-90°) mulai agak terdorong keluar, tidak menutup black hole. Efek black hole (bloom/brightness) boleh kamu naikkan sedikit dalam rentang yaw itu, jadi “reveal” terasa seperti event.

Di sisi kanan, zodiac tetap terlihat karena highlight zone tetap ada. Kalau user terus muter ke kiri sampai belakang, zodiac yang semula highlight akan bergeser dan yang lain akan mengambil alih highlight—jadi zodiac selalu “ada” tanpa terasa random.

Sekarang kamu minta transisinya seperti video, jadi aku kunci juga “kurva” dan koreografi yang pas untuk panel, planet, dan search/keyboard.

Masuk FocusPanelMode (panel dipencet), feel yang paling premium biasanya seperti ini: panel yang dipilih bergerak duluan (leading motion) sekitar 120–160 ms, baru kamera rig “mengikuti” halus. Jadi user merasakan panel itu punya “intent”. Durasi total transisi masuk fokus yang enak adalah sekitar 0.85 detik. Panel aktif bergerak ke FocusAnchor di depan kamera (posisi relatif kamera yang nyaman dibaca, misalnya sekitar 4 unit di depan), skalanya naik dari kecil jadi besar, lalu panel-panel lain di ring mengecil dan menjauh sedikit dengan easing yang lebih lembut supaya mereka terasa jadi latar, bukan hilang.

Keluar FocusPanelMode lebih cepat, sekitar 0.65 detik, karena otak user sudah tahu mau balik. Semua properti dibalik, tapi tetap pakai easing halus (tidak linear) agar tidak terasa patah.

Masuk PlanetHubMode (planet dipencet), durasi yang enak sekitar 0.95 detik karena ini perubahan struktur UI: planet maju ke center dan membesar, ring panel mengubah pusat orbit dari origin ke planet. Kesan yang kamu cari adalah “planet jadi navigasi”—jadi saat PlanetHubMode aktif, panel-panel inti (Game, Project, Gallery, Media, News, Docs, Team, Contact) menjadi satelit utama mengorbit planet dalam lingkaran kecil. Panel ekstra (About, Careers, Community, Support, Roadmap, Status) bisa ikut mengorbit di orbit kedua yang lebih besar dan lebih redup, seperti layer kedua navigasi. Ini bikin planet mode terlihat ramai tapi tetap terstruktur.

Susunan satelit yang paling enak secara visual (supaya terasa simetris dan sesuai prioritas) biasanya menempatkan Game di atas atau atas-kiri orbit planet, Project di atas-kanan, Gallery di kanan, Media di kanan-bawah, News di bawah, Docs di kiri-bawah, Team di kiri, Contact di kiri-atas. Dengan komposisi itu, user bisa baca orbit seperti jam.

Sekarang soal search bar dan keyboard hologram, supaya sesuai sketsa kamu (keyboard terlihat jelas hanya kalau kamera menunduk). Pitch kamera kamu batasi -24° sampai +12°. Ambang “keyboard reveal” yang enak sekitar pitch -14° sampai -16°. Begitu user menunduk melewati ambang ini, keyboard hologram “naik” secara visual (atau lebih tepatnya: opacity dan glow naik, dan ia menjadi fokus), dan search bar yang semula di atas tertarik turun sedikit ke area tengah-atas sehingga terasa menyambung ke keyboard. Durasi micro-transition ini pendek, sekitar 0.3 detik, karena ini harus terasa responsif. Saat user menengadah lagi melewati ambang balik (misalnya -10°), keyboard pelan memudar lagi tapi tidak menghilang total, jadi tetap “ada di semesta” seperti kamu minta.

Sekarang detail yang sering menentukan apakah UI panel terasa premium atau cuma “kotak melayang”: masing-masing panel bisa punya “signature micro-behavior” sesuai tema, tapi jangan berlebihan, cukup subtle.

Game panel bisa punya preview “portal”: misalnya shimmer halus dan indikator “Launch” yang terasa seperti tombol energi. Saat hover, glow edge meningkat dan ada sedikit distorsi scanline seperti hologram.

Project panel enak punya “stacked cards” kecil yang bergeser sedikit, memberi kesan banyak project.

Gallery panel enak punya thumbnail mosaic yang bergerak lambat (parallax internal), jadi terasa visual-first.

Media panel enak punya indikator play kecil dan “frame strip” mini yang bergeser pelan.

News panel enak punya ticker halus yang bergerak, tapi ketika tidak difokuskan, ticker itu cuma hint (jangan bikin pusing).

Docs panel enak punya “index line” seperti daftar, memberi kesan teknis.

Team panel enak punya siluet card profile atau orbit ikon kecil, memberi kesan human.

Contact panel enak jadi paling “tegas”, dengan CTA jelas dan glow yang stabil, bukan ramai.

Panel ekstra juga punya peran: About memberi konteks brand, Careers dan Community menghidupkan studio, Roadmap memberi transparansi, Support memberi rasa profesional, Status membuatnya terasa seperti produk sungguhan.

Terakhir, supaya placement ini benar-benar “kerasa” seperti sketsa kamu, aku kunci aturan “density dan keterbacaan” di landing: pada yaw 0°, kamu idealnya menampilkan sekitar 5–7 panel yang jelas tanpa harus muter jauh. Dengan placement yang aku kasih, area depan (-30° sampai +90°) berisi Game, Project, Gallery, planet hub, Media, News—ini sudah 6 titik yang bisa dipencet dan terlihat jelas. Sisanya tetap ada di 360° sebagai hadiah eksplorasi.

---

Oke, aku nangkep persis yang kamu mau: panel “Game” itu bentuknya seperti kartu video yang bisa diputar (ada preview video), lalu di bawah video ada deskripsi singkat seperti halaman trailer, dan ketika kamu “masuk” (dipencet tombol/area enter), panel itu berubah jadi portal: layarnya membesar, lalu terjadi transisi “Link Start” ala Sword Art Online (warp garis-garis, kesan tersedot/teleport), dan akhirnya kamu benar-benar dibawa ke “dunia” yang ada di video itu, bukan cuma nonton videonya.

Di blueprint semesta yang tadi (ring panel 360°, black hole kiri, zodiac kanan), efek ini paling cocok dibuat sebagai mekanisme khusus untuk panel bertipe “World Entry”, dan Game adalah kandidat utamanya. Jadi Game panel bukan cuma panel informasi, dia adalah “gerbang”.

Yang bikin pengalaman ini terasa premium adalah kamu tidak melakukan “klik → buka halaman baru biasa”, tapi kamu melakukan “klik → dunia merespons → portal terbuka → kamu masuk”. Secara teknis, itu artinya kamu butuh dua lapis realitas yang saling ditumpuk rapi: semesta utama (galaxy UI + black hole + panel ring) dan semesta game (world scene) yang dimuat terpisah, lalu kamu crossfade/warp antar keduanya dengan satu transisi yang benar-benar dirancang.

Sekarang aku kunci blueprint interaksi “Game panel” ini dari ujung ke ujung, mulai dari bentuk panel di ring, cara dia jadi besar, cara video tampil, sampai cara “Link Start” terjadi dan akhirnya benar-benar masuk ke dunia game.

Judul besar dari flow ini: Game panel punya dua level. Level pertama adalah “di orbit” (kecil, jadi bagian ring 360°). Level kedua adalah “di fokus” (besar, jadi seperti layar trailer + deskripsi). Dari level kedua barulah kamu punya aksi “Enter World” yang memicu transisi Link Start.

Di orbit, panel Game tetap mengikuti placement yang sudah kita set sebelumnya, yaitu dekat depan-kiri sekitar azimuth -15°, radius lebih dekat sedikit dari panel lain supaya jadi CTA utama. Saat masih kecil, yang terlihat bukan video panjang, tapi preview yang ringan dan jelas, misalnya looping 2–4 detik tanpa audio, supaya GPU dan bandwidth aman. Bentuknya bisa seperti kartu dengan area video di atas dan strip kecil judul di bawah, tapi strip bawah ini tidak usah menampilkan deskripsi panjang dulu karena di orbit keterbacaan kecil. Yang penting, user langsung paham itu “video panel” karena ada motion di dalamnya.

Saat panel Game dipilih dan masuk FocusPanelMode, barulah bentuknya berubah seperti yang kamu minta: area video besar di atas (seperti layar utama), dan deskripsi di bawahnya. Di sini kamu bisa menampilkan sesuatu yang mirip halaman trailer: judul game, satu kalimat hook, dua atau tiga tag kecil (genre, platform, status), lalu satu tombol utama yang jelas seperti “Enter World” atau “Link Start”. Pada momen ini video bisa autoplay dengan audio yang sangat pelan atau tetap tanpa audio sampai user menekan play, tapi aku sarankan audio baru muncul saat user benar-benar menekan Enter World atau menekan tombol play, karena browser mobile sering ketat soal autoplay audio.

Agar tetap terasa “di semesta”, panel besar ini tidak boleh jadi kotak 2D datar seperti modal biasa. Dia tetap harus berupa objek hologram 3D yang mengambang, punya sedikit ketebalan, edge glow, noise scanline halus, dan yang paling penting: dia punya parallax kecil terhadap kamera, jadi saat user menggeser sedikit yaw, panel tetap terasa berada di ruang, bukan UI overlay.

Sekarang bagian yang kamu minta: ketika dipencet untuk masuk, “layar membesar” lalu Link Start membawa kamu masuk ke dunia.

Efek “layar membesar” yang terasa SAO itu bukan sekadar scale up. Yang terasa khas adalah kombinasi tiga hal: panel jadi memenuhi pandangan, ada akselerasi ke depan seperti “jatuh masuk layar”, dan ada warp garis-garis yang muncul dari pusat (radial streaks). Jadi implementasi yang paling pas adalah: panel video itu menjadi sumber portal, lalu portal itu “menelan” kamera.

Secara blueprint, ketika user menekan Enter World, dunia utama langsung bereaksi dulu sebentar sebelum warp dimulai. Black hole di kiri tidak hilang mendadak, tapi intensitasnya turun, bloom-nya meredup sedikit, seolah fokus berpindah. Panel-panel lain di ring mengecil lebih jauh dan opacities turun, seolah kamu sedang “memutus koneksi” dari UI ring. Ini cuma sepersekian detik, tapi penting agar transisi terasa disengaja, bukan sekadar efek random.

Setelah itu panel Game mulai maju ke arah kamera dan membesar sampai memenuhi frame. Pada fase ini, video di panel tetap berjalan, sehingga user merasa dia sedang “mendekati layar video”. Begitu panel hampir full-screen, tepinya tidak dibiarkan jadi kotak biasa. Kamu bikin tepi panel jadi semacam bingkai energi hologram yang getar halus, dan di saat yang sama kamu mulai memunculkan chromatic aberration tipis dan blur radial yang sangat halus, sehingga mata mulai merasa “ada teleport”.

Lalu Link Start phase masuk. Ini sebaiknya kamu lakukan sebagai overlay shader full-screen yang bekerja di atas render, bukan sekadar partikel di ruang. Kenapa? Karena efek SAO itu rasa utamanya ada di distorsi layar: garis-garis memancar, kontras naik, warna pecah sedikit, dan pusatnya seperti lubang yang menarik. Overlay full-screen akan jauh lebih bersih dan bisa konsisten di semua device.

Sumber visual Link Start bisa kamu ambil dari dua pendekatan yang sama-sama valid, tinggal pilih rasa. Pendekatan pertama adalah membuat streaks procedural di shader: kamu generate ratusan garis radial yang punya panjang dan ketebalan berbeda, bergerak cepat ke luar atau ke dalam, dikasih noise supaya tidak terlalu rapi, lalu ditambah bloom. Pendekatan ini membuat kamu tidak tergantung asset, dan bisa kamu tune agar cocok dengan style black hole kamu.

Pendekatan kedua adalah memakai texture streak loop (seperti footage warp) yang kamu mapping ke full-screen quad, lalu kamu distorsi dan blend secara additive. Ini lebih cepat bikin “rasa anime” dan bisa lebih mirip video referensi kamu, tapi lebih bergantung pada asset.

Yang paling “jenius” untuk website kamu adalah menggabungkan keduanya: streak shader sebagai inti, lalu sedikit texture noise/film grain agar tidak terlihat terlalu bersih. Dengan begitu, portal terasa “energi digital”, cocok dengan hologram panel dan semesta.

Pada puncak Link Start, kamu butuh momen “snap” yang terasa seperti berpindah dunia. Ini biasanya dilakukan dengan satu beat putih terang atau flash singkat, lalu tiba-tiba detail dunia baru muncul. Flash ini jangan terlalu lama, cukup singkat agar tidak menyakitkan mata, tapi cukup jelas agar otak menganggap “teleport berhasil”.

Masalah utama di sini bukan visual, tapi timing load dunia game. Kalau dunia game kamu adalah scene Three.js lain, kamu bisa swap scene di saat flash itu terjadi. Kalau dunia game kamu adalah Unity WebGL atau game eksternal (misalnya game di link Ophius Studio), kamu harus mengakali supaya saat flash terjadi, halaman game sudah siap tampil, minimal sudah menampilkan first frame atau loading screen yang serasi.

Jadi blueprint loading-nya begini (aku tulis sebagai narasi, bukan langkah): saat user sedang menonton preview di FocusPanelMode, kamu sudah bisa diam-diam melakukan prefetch ringan untuk dunia game. Prefetch ini bisa berupa download asset bundle dasar, atau minimal memuat “shell” route game agar ketika user menekan Enter World, kamu tidak mulai dari nol. Karena user biasanya akan baca deskripsi selama 1–3 detik, itu cukup untuk menyicil loading tanpa terasa.

Ketika Enter World dipencet, kamu langsung kunci kontrol kamera, mulai transisi, dan pada saat panel membesar, kamu mulai memulai loading serius untuk game world di background. Pada momen flash Link Start, kamu lakukan swap: semesta utama di-hide, semesta game di-show. Kalau game world belum sepenuhnya siap, kamu tetap bisa masuk ke “anteroom” yaitu ruang transisi: star tunnel sederhana yang masih satu renderer dengan website, sementara game sebenarnya menyelesaikan loading di belakang. Begitu game siap, star tunnel memudar dan game world muncul. Dengan trik ini, kamu tidak pernah memberi kesan loading lama yang mematahkan magic.

Sekarang, “dibawa masuk ke dunia di video itu” bisa berarti dua tipe dunia, dan aku blueprint keduanya agar kamu bisa pilih sesuai game kamu sebenarnya.

Kalau “dunia” itu adalah dunia 3D yang juga kamu buat dengan Three.js/R3F, maka entry paling mulus adalah melanjutkan dari video panel. Kamu bisa pakai video sebagai “sky portal” beberapa frame pertama, lalu dunia 3D muncul dengan komposisi yang mirip video. Misalnya video kamu adalah hutan berkabut, maka dunia awal game menampilkan fog dan silhouettes yang mirip, sehingga transisi terasa natural. Ini level premium.

Kalau “dunia” itu adalah game terpisah (Unity WebGL atau iframe game), maka entry paling aman adalah membuat kontainer game full-screen di route baru, tetapi transisi Link Start tetap terjadi di atasnya. Jadi secara visual user merasa portal membawa masuk, padahal di bawah overlay kamu sedang menampilkan canvas Unity/iframe yang baru muncul. Begitu overlay selesai, user sudah berada di game. Ini jauh lebih realistis untuk produksi karena kamu bisa menautkan game yang sudah ada tanpa rewrite engine.

Agar efek “SAO screen expands” terasa benar, ukuran panel game pada FocusPanelMode harus punya rasio yang seperti layar, misalnya 16:9 atau sedikit lebih cinematic. Jadi panel besar punya area video 16:9, dan deskripsi berada di bawah sebagai area teks. Ketika Enter World ditekan, panel tidak harus mempertahankan bentuk dengan deskripsi. Yang dilakukan adalah: area video-lah yang menjadi portal. Jadi deskripsi akan memudar keluar dulu, lalu video area membesar dan menelan layar. Ini penting supaya portal tidak terlihat aneh membawa teks ikut tersedot.

Biar makin “anime login system”, kamu bisa menambahkan overlay UI futuristik yang muncul sangat singkat saat portal dimulai, seperti garis-garis HUD, teks kecil “LINK START” yang melintas, lalu hilang. Itu tidak perlu banyak, tapi cukup untuk memberi signature.

Sekarang aku kaitkan ini ke blueprint panel ring kamu yang lain, supaya semuanya konsisten dan bisa kamu reuse.

Game panel adalah satu-satunya panel yang punya “World Entry” super dramatis. Project, Gallery, Media bisa memakai versi transisi yang sama tapi lebih ringan. Misalnya Gallery kalau dipencet bisa membawa kamu masuk ke ruang gallery immersive (masih di website) dengan transisi warp yang lebih halus. Media bisa masuk ke ruang media wall. Ini membuat sistem kamu terasa punya bahasa transisi yang konsisten.

Namun supaya tidak semuanya terasa sama, Game panel punya ciri paling kuat: Link Start dengan radial streaks yang agresif. Panel lain cukup memakai zoom + bloom + crossfade.

Kalau kamu setuju dengan bentuk ini, aku bisa mengunci satu hal lagi yang akan bikin ini benar-benar “kerja” saat coding: standar komponen Game panel beserta “contract”-nya. Contract ini artinya setiap game entry punya data yang sama: video preview (mp4/stream), poster image (fallback), title, short description, tags, dan target world route atau target link. Jadi kamu bisa nambah game baru tanpa ngubah sistem transisi; kamu cuma nambah data.

Kamu juga tadi bilang “kayak gini” sambil kirim video SAO Link Start. Berdasarkan itu, aku sarankan style Link Start kamu condong ke “streak tunnel” yang kaya warna, tapi tetap diselaraskan dengan semesta black hole kamu. Cara nyelarasinnya adalah: warna streak bisa dominan putih-biru (biar nyambung ke black hole glow), lalu sesekali ada aksen warna (hijau/ungu/merah) tipis seperti video referensi kamu, tapi tidak terlalu ramai supaya tidak bentrok dengan aesthetic hologram panel.

---

Oke, berarti “Link Start / portal” itu bukan cuma buat Game, tapi jadi **bahasa navigasi utama** setiap kali user keluar dari semesta 3D (baik ke halaman 2D internal yang banyak, maupun ke link eksternal). Game panel tetap ada di semesta 3D seperti kartu video + deskripsi, tapi tombolnya mengarah ke **Steam / itch.io / Play Store** (download), jadi dia memakai “portal eksternal” (bukan masuk world 3D).

Di blueprint ini aku kunci satu sistem inti bernama **Portal Transition System** yang bekerja konsisten di semua kondisi: dari 3D → 2D internal, dari 3D → eksternal, dari 2D internal → balik ke 3D, bahkan dari 2D internal → 2D internal lain (kalau kamu mau tetap pakai portal biar gaya kamu konsisten).

---

## Portal Transition System sebagai “bahasa pindah dimensi”

Kamu akan punya dua dunia yang beda “realm”.

Realm A adalah **Galaxy UI** (3D): black hole anchor, ring panel 360°, zodiac jauh, keyboard hologram, planet hub, dan mode-mode interaksi yang sudah kita susun.

Realm B adalah **Pages** (2D/normal web): halaman-halaman yang jumlahnya banyak, bisa panjang, bisa punya layout biasa, bisa SEO-friendly, bisa gampang dibangun dan di-maintain.

Portal Transition System tugasnya adalah membuat perpindahan A ↔ B terasa seperti “buka link → layar membesar → warp → tiba di halaman tujuan”, bukan seperti “klik → pindah halaman biasa”.

Yang paling penting: Portal ini harus **tetap ada meskipun halaman tujuan bukan 3D**. Itu berarti efeknya tidak boleh tergantung pada scene 3D saja. Dia harus hidup sebagai overlay global di level app, supaya saat kamu pindah route ke halaman 2D, portal masih bisa lanjut sampai selesai dan tidak patah.

Jadi portal bukan sekadar “animasi kamera”. Portal adalah satu lapisan visual full-screen yang bisa muncul di atas apapun.

---

## Struktur aplikasi supaya portal tidak pernah patah

Secara arsitektur UI, kamu punya satu Root App Shell yang selalu hidup. Di dalamnya ada tiga blok besar.

Blok pertama adalah **GalaxyCanvas** (3D). Ini hanya aktif ketika route kamu sedang “di semesta” (misalnya `/` atau `/galaxy`). Saat kamu keluar ke halaman 2D, GalaxyCanvas bisa disembunyikan atau dipause, bukan harus dihapus total. Kalau kamu pause, balik ke semesta jadi instan dan terasa “nyambung”.

Blok kedua adalah **PageSurface** (2D). Ini adalah outlet untuk route halaman biasa: `/projects`, `/docs`, `/team`, `/news`, `/gallery`, `/contact`, dan halaman tambahan yang jumlahnya banyak.

Blok ketiga adalah **PortalOverlay**. Ini selalu ada di atas semuanya dan punya kontrol penuh atas transisi. PortalOverlay inilah yang menampilkan efek “Sword Art Online / Link Start” versi kamu, dan inilah yang menentukan kapan benar-benar melakukan navigasi.

Dengan struktur ini, kamu bisa melakukan urutan rasa yang benar: portal mulai, layar warp, lalu di tengah warp kamu swap route atau buka link eksternal, lalu warp selesai dan user sudah ada di tujuan.

---

## Aturan inti: kapan portal dipakai dan kapan tidak

Portal dipakai ketika user melakukan aksi “keluar dari 3D realm” atau “masuk ke 3D realm”.

Saat user di semesta 3D dan membuka panel lalu memilih “Open Page” (Docs, Team, News, dll), portal dipakai.

Saat user di semesta 3D dan menekan tombol store (Steam/itch/Play Store), portal dipakai.

Saat user berada di halaman 2D dan menekan tombol “Back to Galaxy”, portal dipakai (versi reverse).

Kalau user hanya zoom panel, membuka subpanel, filter search, planet hub mode, itu tetap interaksi in-realm, jadi tidak pakai portal besar. Cukup pakai transisi sinematik internal seperti yang sudah kita blueprint.

Ini penting agar portal tidak overused dan user tidak capek.

---

## Game panel versi kamu: “kartu video + deskripsi” tapi tujuan adalah store eksternal

Untuk Game panel, bentuk UI-nya kamu minta seperti halaman trailer: video di atas, deskripsi di bawah. Itu tetap terjadi di FocusPanelMode di dalam semesta 3D.

Di area bawah video, kamu tampilkan tombol store yang sesuai per game. Satu game bisa punya beberapa tombol: Steam, itch.io, Play Store. Masing-masing tombol memicu portal eksternal dengan “profile” yang beda.

Yang terasa SAO itu bukan cuma warp, tapi juga “screen expands”. Jadi saat user menekan tombol store, yang kamu besarkan dan jadikan portal adalah **area video** (bukan seluruh panel termasuk teks). Teks deskripsi memudar cepat, kemudian video frame menjadi “portal frame” yang membesar sampai memenuhi layar, lalu warp dimulai.

Kesan “dibawa masuk ke video” bisa kamu jaga dengan cara membuat frame terakhir sebelum warp tetap memperlihatkan isi video, lalu warp muncul di atasnya, seolah kamu masuk lewat layar itu.

---

## Tantangan eksternal link dan cara yang benar supaya portal tetap selesai

Kalau kamu navigasi eksternal di tab yang sama, browser akan unload halaman dan animasi portal akan kepotong. Jadi supaya pengalaman kamu tetap utuh, ada dua gaya yang realistis.

Gaya pertama adalah membuka link eksternal di tab baru. Ini paling aman untuk menjaga semesta 3D tetap hidup dan user bisa balik tanpa kehilangan posisi. Untuk mencegah popup blocker, tab baru harus dibuka langsung saat klik (gesture user), lalu URL baru dipasang setelah portal mencapai fase tertentu. Hasilnya user melihat portal selesai di tab utama, lalu tab baru terbuka menampilkan store.

Gaya kedua adalah tetap di tab yang sama, tapi kamu accept bahwa portal hanya perlu berjalan sampai “puncak warp”, lalu segera redirect. Ini masih bisa terasa keren kalau kamu desain portal puncaknya terjadi cepat (misalnya 0.6–0.8 detik total), jadi user tetap merasa ada Link Start sebelum pindah.

Untuk brand experience studio, biasanya gaya pertama lebih premium: portal selesai, semesta tetap ada, store kebuka di tab lain.

---

## Portal “menyesuaikan buka halaman apa”: Portal Profiles

Ini bagian yang kamu minta: bentuk link menyesuaikan halaman. Jadi portal itu punya “profile” berdasarkan destination.

Profile menentukan warna utama, pola streak, kecepatan warp, elemen HUD yang muncul sebentar, dan karakter suara kalau kamu pakai audio.

Kamu bisa punya base portal yang sama (radial streaks + bloom + grain + chromatic edge), tapi setiap destination punya varian pattern yang beda supaya user merasa “oh ini pindah ke Docs” beda dari “pindah ke News” atau “pindah ke Store”.

Di bawah ini aku kunci profile yang cocok dengan tema panel kamu (termasuk tambahan panel yang sebelumnya aku usulkan), dan aku buat selaras dengan semesta black hole (dominansi putih-biru sebagai DNA, lalu aksen warna untuk tiap tipe).

| Destination                                    | Profile name       | Rasa visual portal                             | Aksen warna              | Pattern khas                                |
| ---------------------------------------------- | ------------------ | ---------------------------------------------- | ------------------------ | ------------------------------------------- |
| Docs                                           | “Blueprint Tunnel” | warp terasa teknis, rapi, seperti masuk sistem | cyan-biru                | grid lines + radial streaks tipis           |
| Projects                                       | “Assembler”        | masuk ke ruang karya, modular                  | biru-ke-ungu             | blok kotak kecil melesat seperti card stack |
| Team                                           | “Heartbeat”        | lebih human, lembut, hangat                    | magenta lembut           | pulse ring + streak lebih halus             |
| Gallery                                        | “Shutter Warp”     | visual-first, seperti lensa kamera             | putih + sedikit emas     | aperture sweep + sparkle halus              |
| Media                                          | “Filmstrip Jump”   | cinematic, trailer vibe                        | biru + amber tipis       | frame-strip bergerak + streak               |
| News                                           | “Ticker Rush”      | cepat, informatif                              | amber-oranye             | garis ticker melintas + streak cepat        |
| Contact                                        | “Signal Gate”      | tegas, call-to-action                          | hijau-neon               | wave signal + portal ring jelas             |
| Store link (Steam/itch/Play)                   | “Download Dive”    | paling SAO, paling agresif                     | hijau + putih            | streak kuat + icon hint “download” sebentar |
| About/Community/Careers/Support/Status/Roadmap | “Utility Jump”     | utilitarian tapi tetap keren                   | biru dengan aksen sesuai | variasi ringan dari Blueprint Tunnel        |

Profile ini membuat portal kamu “punya bahasa”. User akan belajar secara intuitif: portal hijau agresif itu store/download, portal cyan-grid itu docs/sistem, portal amber itu news, portal lensa itu gallery.

---

## Koreografi portal yang terasa “Sword Art Online” tapi tetap elegan

Portal kamu punya 3 fase rasa yang selalu sama, hanya parameternya yang berubah sesuai profile.

Fase pertama adalah “Lock & Focus”. Dunia 3D merespons: panel lain meredup, black hole intensitas turun sedikit, zodiac tetap ada tapi lebih halus. Fokus pindah ke elemen yang diklik. Ini bikin klik terasa punya bobot.

Fase kedua adalah “Screen Expand”. Elemen yang jadi pintu (video frame untuk Game, panel frame untuk lainnya, atau tombol tertentu) membesar cepat tapi elegan sampai memenuhi layar. Ini meniru rasa “layar membesar” yang kamu sebut.

Fase ketiga adalah “Link Start Warp”. Full-screen overlay mengambil alih: radial streaks, distorsi, bloom, grain, chromatic edge. Pada puncak warp (biasanya di 55–70% progress), baru terjadi perpindahan realm: route diganti ke halaman 2D, atau tab store diarahkan ke URL. Setelah itu portal meluruh dan tujuan terlihat jelas.

Karena kamu mau transisi ini dipakai sering, durasinya harus cukup singkat supaya tidak melelahkan, tapi cukup panjang supaya terasa premium. Untuk internal 2D pages, durasi nyaman biasanya sekitar 0.75–0.95 detik. Untuk store eksternal, 0.6–0.85 detik agar tidak terasa “nahan”.

---

## Navigasi internal 2D pages tanpa loading jelek

Kalau kamu punya banyak halaman 2D, kamu pasti pakai route-based code splitting (halaman dipanggil saat dibutuhkan). Risiko paling umum adalah setelah portal puncak, halaman tujuan belum siap, jadi user melihat blank sesaat. Itu akan merusak efek.

Solusinya adalah portal harus “sinkron” dengan kesiapan halaman. Caranya bukan memperpanjang portal seenaknya, tapi membuat portal punya titik swap yang fleksibel. Jadi portal mulai, lalu di background halaman tujuan diprefetch, dan portal baru melakukan swap saat route sudah siap render minimal layout-nya.

Kamu bisa set “minimal ready” sebagai: komponen halaman sudah ter-load dan skeleton layout sudah bisa tampil. Setelah swap, portal memudar, lalu konten halaman lanjut mengisi. Dengan begitu user tidak pernah melihat layar kosong.

Untuk halaman berat seperti Gallery atau Media, skeleton layout itu penting.

---

## Bagaimana halaman 2D tetap terasa “masih Ophius” walau bukan 3D

Supaya perpindahan realm tidak terasa seperti “keluar dari game jadi web biasa”, halaman 2D tetap perlu meminjam DNA semesta.

Kamu bisa mempertahankan satu elemen latar belakang: misalnya gradient gelap dengan bintik bintang halus, atau bahkan bayangan black hole yang sangat faint sebagai watermark. Jangan full 3D, cukup atmosfer.

Di header halaman 2D, tombol “Back to Galaxy” dibuat jelas. Saat ditekan, portal reverse terjadi: halaman 2D memudar, portal warp, lalu kamu kembali ke semesta 3D di yaw terakhir (atau yaw default kalau kamu mau dramatis). Ini membuat semesta 3D benar-benar jadi home base.

---

## Integrasi dengan panel ring yang sudah kamu tentukan

Dari 8 panel inti yang kamu sebut, alur UX-nya jadi begini dalam rasa, tanpa harus user paham teknis.

User masuk ke semesta 3D, melihat Game sebagai panel unggulan dengan preview video kecil. Kalau user klik Game, panel itu zoom jadi besar: video atas, deskripsi bawah. Dari situ user pilih store, portal “Download Dive” terjadi, store kebuka.

Kalau user klik Docs/Team/News/Contact, panel itu zoom jadi besar sebentar (agar user yakin dia memilih benar), lalu tombol “Open Page” memicu portal sesuai profile. Tujuannya adalah halaman 2D yang benar-benar nyaman dibaca, panjang, dan bisa sebanyak yang kamu mau.

Kalau user klik Gallery atau Media, kamu bisa memberi dua opsi: tetap di 3D (misalnya gallery wall inside galaxy) atau langsung page 2D. Karena kamu bilang “banyak halaman”, blueprint yang paling aman adalah: Gallery dan Media menjadi halaman 2D dulu, tapi tetap memakai portal profile yang kuat agar terasa premium.

---

## Hal penting untuk kenyamanan dan profesionalitas

Karena efek warp cukup intens, kamu perlu mode “reduce motion”. Kalau device atau user mengaktifkan preferensi reduce motion, portal tetap ada tapi versinya lebih lembut: tanpa streak agresif, lebih ke fade + zoom + blur ringan. Ini penting supaya pengalaman tidak bikin pusing untuk sebagian orang.

Selain itu, untuk audio, kalau kamu pakai SFX “Link Start”, pastikan dia off by default atau volume rendah sampai user mengizinkan audio, karena kebijakan browser mobile ketat.

---

Kalau kamu oke dengan blueprint ini, bagian berikutnya yang paling berguna adalah aku mengunci “desain panel Game di FocusPanelMode” secara detail: layout video, layout deskripsi, tombol store, dan micro-interaction-nya, plus aku kunci “profile parameter” (warna, kecepatan, pattern) untuk masing-masing destination supaya hasil akhirnya konsisten dan tidak berubah-ubah saat coding.

Aku cuma butuh satu keputusan gaya: saat user klik panel seperti Docs/Team/News, kamu maunya langsung portal tanpa berhenti, atau kamu maunya selalu ada “preview fokus 0.2–0.35 detik” (panel membesar sebentar) baru portal jalan? Ini menentukan rasa “cinematic” vs “snappy”.

---

Sip, kita kunci pola itu sebagai “signature” navigasi kamu: setiap kali user klik panel yang menuju halaman 2D atau link eksternal, selalu ada momen “preview fokus” sekitar 0.2–0.35 detik (aku sarankan 0.28 detik sebagai default), baru setelah itu portal/Link Start jalan. Ini yang bikin terasa sinematik dan “punya niat”, bukan sekadar klik lalu pindah.

Di bawah ini blueprint finalnya, lengkap sampai timing, state, cara swap halaman tanpa blank, dan cara portal menyesuaikan destination. Aku tulis sebagai spesifikasi perilaku (behavior spec) supaya nanti waktu coding kamu tinggal mengikuti kontraknya.

---

## Bahasa navigasi yang kamu pakai

Semesta 3D adalah “home realm” dan semua panel adalah “object di ruang”. Halaman 2D adalah “outside realm” yang bisa sebanyak apa pun tanpa membebani scene 3D. Portal/Link Start adalah “jembatan” antar realm.

Kamu ingin setiap navigasi keluar masuk punya ritme yang konsisten: user memilih sesuatu → semesta merespons dan mengunci pilihan itu → pilihan itu membesar sebentar sebagai “konfirmasi visual” → baru portal mengambil alih → swap tujuan terjadi di puncak portal → portal meluruh → user berada di halaman tujuan.

Ritme ini harus terasa sama untuk internal pages dan external links, bedanya hanya bentuk portal dan strategi swap-nya.

---

## State dan ritme transisi yang selalu sama

Setiap klik panel yang akan menuju realm 2D memicu state mikro bernama FocusPreview. Ini bukan FocusPanelMode penuh (yang panel jadi halaman besar lengkap), tapi preview pendek yang fungsinya membuat user yakin “aku benar-benar memilih ini”.

Begitu user klik panel, panel tidak langsung teleport. Panel “menghadap” kamera dengan easing halus, maju sedikit dari orbit, glow-nya naik, dan panel-panel lain turun sedikit opasitasnya agar fokus mata tertarik ke panel terpilih. Durasi fase ini kamu kunci di 0.28 detik (boleh kamu random halus 0.24–0.33 agar terasa organik, tapi default 0.28 enak).

Setelah 0.28 detik, portal mulai masuk. Portal tidak muncul tiba-tiba; ia muncul sebagai lapisan energi yang “lahir” dari panel yang dipilih. Ini penting supaya transisi terasa sebab-akibat: panelnya yang membuka gerbang, bukan overlay random.

Saat portal sudah berjalan, kontrol kamera dikunci (biar user tidak mengganggu koreografi). Panel lain menjauh dan meredup sedikit lagi, black hole intensitasnya turun halus supaya tidak bersaing dengan portal, dan zodiac tetap samar di sisi yang bersih agar semesta terasa masih ada sampai detik terakhir sebelum swap.

Di puncak portal (sekitar 60–70% progres portal), baru kamu lakukan “swap tujuan”. Swap bisa berarti mengganti route ke halaman 2D internal, atau membuka link eksternal. Setelah swap sukses, portal tidak langsung hilang; portal masih meluruh sekitar 0.2–0.35 detik supaya mata user punya waktu adaptasi dan tidak terasa “pop”.

---

## Timing yang aku kunci biar rasa sinematiknya konsisten

Aku set total navigasi internal (3D → 2D page) berada di kisaran 0.95–1.20 detik. Ini sudah termasuk preview fokus 0.28 detik. Jadi portal out-nya sendiri sekitar 0.72–0.92 detik, tergantung profile.

Untuk external link (Steam/itch/Play Store), total bisa sedikit lebih cepat, sekitar 0.85–1.05 detik, karena kamu tidak mau user merasa “ditahan” sebelum membuka store. Preview fokus tetap ada 0.28 detik, lalu portal out sekitar 0.55–0.75 detik.

Yang membuat ini terasa SAO bukan lamanya, tapi akselerasinya. Pada portal out, rasa “Link Start” enaknya dimulai lembut selama ~0.12–0.18 detik (muncul ring energi dan distorsi halus), lalu masuk fase akselerasi cepat (streak memanjang, radial blur meningkat), lalu puncak flash singkat, lalu meluruh.

---

## Cara portal “menyesuaikan buka halaman apa” tanpa bikin sistem jadi berantakan

Portal kamu punya “profile” yang mempengaruhi parameter visual: kepadatan streak, arah streak (masuk/keluar), warna aksen, elemen HUD sesaat, dan karakter gerakan (rapi vs chaotic). Tetapi kerangka ritmenya tetap sama.

Docs dan halaman teknis (Docs, Status, Roadmap) terasa seperti “masuk sistem”: streak lebih rapi, ada kesan grid tipis, aksen cyan-biru, dan distorsinya tidak terlalu liar. Ini cocok dengan identitas hologram dan semesta black hole.

Projects terasa modular: streak tetap radial, tapi ada aksen blok/kartu kecil yang melesat seperti “stack of cards” supaya nyambung ke ide project tiles.

Gallery terasa lensa: ada sweep seperti aperture yang menutup lalu membuka, ditambah sparkle halus, jadi terasa visual dan artistik.

Media terasa filmstrip: ada gerak frame-strip singkat yang melintas sebelum streak mengambil alih, memberi rasa trailer/press kit.

News terasa cepat: streak lebih pendek tapi lebih banyak, ada elemen “ticker” garis horizontal yang melintas cepat sesaat, aksen amber-oranye.

Team terasa lebih lembut: streak lebih halus, ada pulse ring tipis, aksen magenta halus, supaya kesan “human”.

Contact terasa sinyal: ada gelombang signal ring, aksen hijau neon, portal ring lebih tegas agar CTA terasa kuat.

Store/download (Steam/itch/Play Store) terasa paling SAO: streak padat dan agresif, aksen hijau-putih, sedikit chromatic edge, dan ada flash yang paling tegas. Inilah yang kamu pakai untuk tombol download di Game panel.

---

## FocusPreview harus selalu terlihat “niat”, bukan cuma scale biasa

Pada FocusPreview 0.28 detik, panel melakukan tiga hal bersamaan yang membuat otak user merasa “aku barusan memilih sesuatu”.

Panel bergerak maju sedikit dari orbit (bukan hanya scale), kira-kira 0.7–1.2 unit ke arah kamera, sehingga terasa keluar dari kerumunan.

Panel memutar orientasinya lebih menghadap kamera (billboard halus) sehingga kontennya terbaca, tapi tetap terasa 3D karena kamu bisa mempertahankan sedikit kemiringan.

Glow dan highlight meningkat, lalu stabil di akhir preview. Ini penting: kalau glow terus meningkat sampai portal dimulai, terasa liar. Lebih enak glow naik, lalu “nahan” sebentar 40–80 ms di puncak preview sebelum portal mengambil alih.

Di momen preview ini, panel-panel lain tidak boleh hilang. Mereka hanya meredup tipis dan sedikit menjauh. Tujuannya agar semesta masih terasa utuh saat user mengambil keputusan, lalu portal terasa sebagai peristiwa, bukan sebagai “pergantian layout”.

---

## Cara swap ke halaman 2D internal tanpa pernah muncul blank

Ini titik yang sering merusak efek kalau salah.

Begitu FocusPreview dimulai, kamu langsung mulai “prefetch” halaman tujuan. Jadi bukan menunggu portal selesai. User tidak merasa loading karena dia sedang melihat preview dan portal.

Swap route idealnya terjadi di puncak portal (sekitar 65% progres). Tetapi swap hanya boleh dilakukan jika halaman tujuan sudah “minimal ready”. Minimal ready di sini bukan seluruh konten sudah lengkap, tapi struktur layout dasar sudah bisa render (header, container, skeleton).

Kalau halaman belum minimal ready saat progres portal mencapai titik swap, portal tidak boleh selesai dalam keadaan kosong. Portal menahan puncak 80–180 ms sambil menunggu ready, dengan cara membuat streak tetap bergerak agar user tidak merasa “freeze”. Begitu ready, swap terjadi, lalu portal meluruh.

Dengan mekanisme ini, user tidak akan pernah melihat layar putih/hitam kosong setelah portal.

---

## Cara balik dari halaman 2D ke semesta 3D dengan portal reverse

Di halaman 2D, kamu sediakan tombol “Back to Galaxy” yang jelas. Saat ditekan, halaman 2D tidak langsung menghilang. Ia masuk preview kecil versi 2D: konten sedikit blur dan mengecil halus 0.22–0.30 detik (ini analog FocusPreview), lalu portal reverse mulai.

Saat portal reverse berjalan, kamu “unpause” GalaxyCanvas yang tadi dipause, mengembalikan yaw/pitch terakhir user sebelum keluar (jadi user merasa semesta itu tetap ada dan menunggu). Lalu portal meluruh dan kamu sudah kembali ke semesta 3D, dengan black hole tetap di posisi lore-nya (kiri) dan zodiac tetap di sisi bersih sesuai arah pandang terakhir.

Ini membuat semesta 3D benar-benar “home” yang konsisten, bukan background yang hilang muncul.

---

## Game panel sesuai permintaan kamu, tapi tujuannya store

Game panel kamu tetap punya format yang kamu mau: saat di-zoom (bukan saat preview 0.28 detik, tapi saat user memang membuka Game panel), video besar di atas, deskripsi di bawah. Namun saat user menekan tombol store, jalurnya kembali ke pola global: FocusPreview 0.28 detik khusus untuk tombol/area video, lalu portal “Download Dive” terjadi, lalu buka store.

Kuncinya adalah portal lahir dari area video, bukan dari teks. Jadi saat tombol store dipencet, teks deskripsi memudar cepat, video frame menjadi “portal frame”, frame membesar memenuhi layar, lalu streak SAO muncul.

Untuk eksternal link, pengalaman paling premium adalah membuka store di tab baru, karena portal bisa selesai di tab utama tanpa terpotong, dan user tetap bisa kembali ke semesta. Namun kalau kamu memilih membuka di tab yang sama, portal tetap bisa terasa keren asalkan kamu membuat puncaknya cepat dan redirect terjadi tepat setelah flash.

---

## Proteksi supaya tidak ada double click dan tidak ada “kesangkut”

Begitu FocusPreview mulai, kamu set “navigation lock” agar klik lain tidak memicu transisi baru sampai portal selesai atau dibatalkan. Kalau user spam klik, kamu hanya memberikan feedback kecil (misalnya bunyi halus atau glow), tapi tidak menjalankan transisi baru.

Kalau user menekan back browser saat portal berjalan, kamu putuskan satu aturan tegas: portal harus selesai dan masuk ke target, atau portal harus dibatalkan dan balik ke state sebelumnya. Jangan setengah-setengah, karena itu yang biasanya bikin UI rusak.

---

## Reduce motion dan device performance supaya aman

Kalau sistem mendeteksi preferensi reduce motion, portal tetap ada tetapi versi lembut: preview fokus tetap 0.28 detik, tetapi streak diganti blur zoom + fade + sedikit noise. Ini mempertahankan identitas tanpa bikin pusing.

Di mobile low-end, portal profile tetap jalan, tapi density streak dan bloom diturunkan agar tidak drop FPS. Portal lebih baik halus dan stabil daripada spektakuler tapi patah-patah.

---

Sip, ini blueprint “2D Pages Realm” yang masih terasa satu semesta dengan Galaxy 3D kamu: latar gelap berbintang yang halus dan tidak ganggu isi, ada “black hole sliver” di kiri seperti landing default, header glassy dengan breadcrumb + tombol Back to Galaxy, dan typography yang berasa hologram tapi tetap enak dibaca panjang.

Aku bikin ini sebagai spesifikasi tampilan dan perilaku, jadi nanti apa pun framework/layout halaman 2D-nya (Docs panjang, News feed, Project detail, dsb) tetap konsisten dan terasa Ophius.

---

## Prinsip rasa yang harus kebaca dalam 1 detik

Saat user “keluar” dari 3D lewat portal dan mendarat di halaman 2D, otak mereka harus langsung merasa: “Aku masih di dunia yang sama, cuma pindah dimensi ke mode baca.” Itu berarti halaman 2D bukan putih bersih, bukan layout blog biasa, tapi tetap semesta: gelap, berbintang halus, ada hint black hole di kiri, dan semua UI punya glow tipis yang sama bahasa dengan panel hologram di 3D.

Di sisi lain, karena ini halaman baca panjang, background tidak boleh terlalu kontras, tidak boleh banyak gerak, dan tidak boleh punya detail terang yang rebutan fokus dengan teks. Jadi background harus “ada” tapi “diam”.

---

## Background 2D: starfield halus + black hole kecil di kiri, tanpa ganggu konten

Bayangkan background 2D kamu terdiri dari tiga layer yang selalu ada.

Layer pertama adalah “void base” berupa gradien gelap yang sangat lembut, bukan hitam polos. Tujuannya memberi kedalaman dan menghindari banding di layar.

Layer kedua adalah starfield. Bukan bintang terang besar, tapi titik-titik kecil yang jarang, kontras rendah, sebagian blur tipis, dan intensitasnya makin kecil ketika mendekati area konten utama. Jadi starfield terasa seperti jauh di belakang, bukan seperti noise di depan mata.

Layer ketiga adalah black hole sliver di kiri. Ini bukan black hole penuh seperti hero 3D, tapi potongan kecil yang seolah “ada di pinggir jendela”. Kuncinya adalah masking: bagian black hole paling terang (accretion disk) harus dipotong dan di-soften, sehingga hanya tersisa kesan bentuk melingkar dan glow tipis, bukan spotlight terang.

Agar benar-benar tidak mengganggu teks, black hole sliver sebaiknya memenuhi kira-kira 12–18% lebar viewport di sisi kiri, lalu memudar ke kanan dengan gradient mask yang panjang. Di area dekat konten (tengah), black hole harus hampir tidak terasa, tinggal sisa ambience.

Kalau kamu mau versi yang paling premium dan “nyambung” dengan 3D, background halaman 2D bisa memakai “frozen capture” dari frame terakhir saat portal keluar dari galaxy. Jadi begitu user pindah ke 2D, mereka sebenarnya masih melihat snapshot semesta yang sama (black hole kecil di kiri, bintang di belakang), lalu di atasnya muncul surface konten. Ini bikin transisi terasa super mulus, dan kamu tidak perlu menebak komposisi black hole—karena komposisinya otomatis sama seperti yang user lihat sebelum keluar.

---

## Surface konten: glass hologram yang readable untuk teks panjang

Konten halaman 2D harus “berdiri” di atas background dengan cara yang mirip panel 3D: transparan, ada blur, ada edge glow, tapi jauh lebih tenang agar nyaman dibaca.

Kamu butuh satu “Content Surface” utama berupa blok lebar terbatas (max width nyaman baca) dengan background semi-transparan gelap. Surface ini memberi tiga hal: kontras teks stabil, starfield tidak ganggu, dan aura sci-fi tetap terasa.

Supaya hologramnya terasa tapi tidak norak, efek yang paling aman adalah kombinasi blur ringan, border tipis bercahaya (lebih terlihat saat hover atau saat scroll di header), dan noise/grain super halus. Noise ini penting supaya glass tidak terlihat “steril”.

Untuk teks panjang, jarak antar paragraf dan line-height harus lega. Jadi walau nuansanya sci-fi, rasa baca tetap modern dan manusiawi, bukan UI game yang rapat.

---

## Header 2D: breadcrumb + Back to Galaxy sebagai kontrol utama

Header halaman 2D adalah “cockpit”. Dia harus selalu memberi konteks lokasi user, dan memberi jalan balik ke semesta 3D kapan saja.

Header sebaiknya sticky di atas, dengan glass effect tipis. Dia tidak boleh menutupi konten banyak, jadi tinggi header harus adaptif: di desktop terasa lega, di mobile lebih ringkas.

Di header ada tiga zona.

Zona kiri adalah tombol Back to Galaxy. Ini bukan sekadar teks; ini tombol yang terasa seperti “return portal”. Tombolnya bisa punya icon kecil (planet/cincin atau panah), glow tipis, dan saat hover/tap ada feedback hologram (scanline halus). Tombol ini memicu portal reverse yang kamu blueprint sebelumnya, jadi baliknya tetap sinematik.

Zona tengah adalah breadcrumb. Breadcrumb harus mudah dibaca, tapi tidak berisik. Gaya yang enak adalah breadcrumb dengan separator tipis yang seperti garis energi, lalu item aktif diberi glow yang lebih jelas. Breadcrumb juga membantu ketika halaman banyak, karena user tahu “aku di Docs > Engine > Getting Started” misalnya.

Zona kanan bisa berisi aksi konteks yang sederhana, seperti search internal untuk Docs atau tombol share. Tapi prinsipnya tetap: jangan menyaingi Back to Galaxy. Back to Galaxy adalah “lifeline” agar user merasa masih di dunia 3D.

Pada scroll, header bisa berubah sedikit: background jadi sedikit lebih solid, border glow sedikit naik, supaya tetap terlihat di atas konten panjang.

---

## Typography: hologram-feel tapi nyaman baca panjang

Kamu butuh dua “suara” tipografi yang konsisten.

Suara pertama adalah display untuk heading dan label UI. Ini yang memberi rasa sci-fi/hologram: sedikit letter spacing, bentuk huruf lebih tegas, dan bisa diberi treatment halus seperti gradient tipis atau glow sangat kecil.

Suara kedua adalah body untuk paragraf panjang. Ini harus super readable: bentuk huruf bersih, line-height lega, dan kontras cukup. Body tidak perlu glow karena glow pada body akan membuat mata cepat lelah.

Secara rasa, heading boleh terasa futuristik, tapi isi artikel harus terasa seperti membaca dokumentasi modern yang nyaman.

Link dan highlight perlu aksen warna yang konsisten dengan semesta 3D. Biasanya aksen cyan-biru cocok sebagai warna utama karena nyambung ke hologram dan black hole glow. Warna lain (ungu, amber, hijau) kamu pakai sebagai aksen konteks (News, Contact, Store) sesuai portal profile, bukan sebagai warna default semua teks.

Untuk code block (Docs), kamu bisa tetap gelap, dengan border tipis, dan highlight sintaks yang tidak terlalu neon. Tujuannya: tetap sci-fi, tapi bukan “RGB gamer”.

---

## Layout halaman 2D: konsisten tapi fleksibel untuk banyak jenis halaman

Karena kamu bilang halaman 2D akan banyak, kamu butuh template yang konsisten supaya tidak terasa tiap halaman beda dunia.

Template paling universal adalah: background semesta, header sticky, content surface utama di tengah, dan di bawahnya footer halus.

Untuk halaman yang memang butuh navigasi (Docs), kamu bisa menambah panel samping (sidebar) yang juga glassy. Sidebar sebaiknya collapsible di mobile. Tapi walau ada sidebar, konten utama tetap punya max width yang nyaman baca.

Untuk halaman yang visual-heavy (Gallery, Media), content surface bisa lebih lebar, tapi tetap ada “reading rail” untuk teks deskripsi. Jadi visual tidak bikin user tersesat.

Untuk News feed, list item bisa berupa kartu-kartu hologram yang lebih kecil, dengan highlight halus saat hover.

Untuk Team, kartu profil bisa lebih “human”: foto dengan mask bulat lembut, name dan role rapi, dan glow minimal.

Untuk Contact, form harus paling jelas dan paling “terarah”, karena form butuh usability, bukan sekadar style. Jadi input field glassy, tetapi label harus terbaca jelas dan error state harus tegas.

---

## Integrasi portal dengan halaman 2D: bukan cuma transisi, tapi identitas navigasi

Karena kamu ingin portal dipakai setiap pindah “realm”, halaman 2D juga harus ikut bahasa itu.

Tombol Back to Galaxy selalu memicu portal reverse. Link internal besar (misalnya dari Project list ke Project detail) juga bisa memicu portal yang lebih ringan, tapi jangan terlalu sering untuk navigasi kecil; cukup untuk perpindahan besar antar section, supaya user tidak capek.

Kalau user berpindah dari Docs ke News lewat header/breadcrumb, portal tetap dipakai (preview fokus singkat di header, lalu portal sesuai profile). Ini membuat meskipun halaman banyak, semuanya terasa satu sistem yang konsisten.

---

## Responsif dan kenyamanan: tetap terasa hologram di mobile, tetap enak dibaca

Di mobile, background starfield tetap ada tapi intensitasnya turun sedikit agar teks kecil tetap jelas. Black hole sliver di kiri boleh berubah jadi “corner glow” yang lebih kecil, karena layar sempit kalau kamu pertahankan 18% lebar akan makan ruang visual.

Header di mobile harus menyederhanakan breadcrumb. Breadcrumb bisa jadi “Section / Page” yang dipendekkan, atau digeser menjadi satu bar yang bisa di-scroll horizontal. Back to Galaxy harus tetap satu tap yang jelas.

Konten surface tetap glass, tapi blur jangan terlalu berat di mobile agar performa aman.

---

## Detail kecil yang bikin “semi sci-fi” terasa mahal, bukan template biasa

Kalau kamu ingin hal ini terasa seperti produk studio AAA, detail yang paling terasa adalah micro-texture: noise/grain halus di surface, garis border yang hidup sangat pelan (bukan animasi mencolok), dan pemakaian highlight warna yang konsisten sesuai section.

Kamu juga bisa menambahkan “constellation lines” super halus di background yang hanya terlihat ketika user diam beberapa detik, tapi ini opsional. Intinya tetap: jangan mengganggu isi.

---

Kalau targetmu adalah hasil yang cepat “kerasa kayak video” sekaligus tidak gampang ambyar pas mulai nambah banyak halaman, prioritas terbaik itu yang paling besar risikonya dan paling menentukan identitas harus dikerjain duluan. Jadi urutannya bukan berdasarkan “mana yang paling gampang”, tapi berdasarkan “mana yang kalau belum beres, semua fitur lain bakal terasa setengah jadi”.

Yang paling pertama harus jadi adalah App Shell yang menyatukan dua realm: semesta 3D dan halaman 2D, plus PortalOverlay yang selalu hidup di atas semuanya. Ini fondasi dari gaya kamu. Begitu PortalOverlay dan ritme transisi “preview fokus 0.28 detik lalu Link Start” sudah stabil, kamu baru boleh merasa aman untuk bikin halaman banyak, karena perpindahan antar halaman akan selalu punya rasa yang konsisten dan tidak ketemu layar kosong. Di fase yang sama, 2D background harus sudah final: starfield halus, black hole sliver di kiri seperti landing, surface konten glassy, header sticky dengan breadcrumb dan Back to Galaxy yang memicu portal reverse. Kalau ini belum jadi, semua halaman 2D akan terasa “keluar dari dunia” dan merusak signature.

Setelah fondasi itu stabil, yang paling tepat untuk jadi halaman 2D pertama adalah Docs. Bukan karena Docs paling penting secara bisnis, tapi karena Docs adalah halaman yang paling “menghukum” desain tipografi dan layout. Docs memaksa kamu membuktikan bahwa style hologram kamu benar-benar nyaman dibaca panjang: heading, paragraf, link, code block, table, sidebar/TOC, dan scroll behavior. Kalau Docs enak, halaman lain akan mudah karena secara readability sudah lulus. Dan karena Docs juga masuk kategori portal profile “Blueprint Tunnel”, ini akan menguji portal versi “teknis” yang harus rapi dan tidak norak.

Begitu Docs sudah enak, berikutnya yang paling penting adalah Projects. Ini inti identitas studio: orang datang, mereka ingin lihat apa yang kamu buat. Projects juga menguji banyak komponen UI 2D yang akan kepakai ulang: grid list, filter/tag, kartu preview, halaman detail dengan gallery kecil, dan cross-link antar proyek. Projects cocok pakai portal profile “Assembler” yang terasa modular. Setelah Projects jadi, websitemu sudah terasa “berisi”, bukan cuma pengalaman visual.

Begitu Projects sudah kuat, barulah kamu balik sedikit ke semesta 3D untuk menuntaskan “hero path” yang paling sering dipakai: Game panel. Alasannya sederhana: Game panel adalah CTA paling menarik di landing 3D (featured), dan kamu sudah minta formatnya harus seperti panel video dengan deskripsi. Pada tahap ini kamu implement Game sebagai panel yang ketika difokuskan menampilkan video besar + deskripsi + tombol store (Steam/itch/Play Store). Tombol store ini menjadi ujian penting untuk portal eksternal: kamu pastikan flow-nya selalu preview fokus 0.28 detik di area video/tombol, lalu portal “Download Dive” yang agresif, lalu buka store dengan strategi yang kamu pilih (paling premium biasanya tab baru supaya portal tetap selesai dan semesta tetap ada). Begitu Game panel beres, pengalaman “wow” kamu di semesta 3D sudah punya payoff nyata: bukan cuma cantik, tapi mengantar user ke aksi.

Setelah itu, baru enak masuk ke News dan Media karena dua ini biasanya saling menguatkan. News adalah ritme update, Media adalah trailer/press kit/video list. Keduanya menguji komponen list dan detail yang beda rasa dari Docs/Projects, dan portal profile-nya juga beda (News yang cepat, Media yang cinematic). Di titik ini, kamu juga bisa mulai menambahkan “micro-consistency” seperti gaya kartu, hover, dan komponen header yang sama, supaya ketika halaman makin banyak, semuanya terasa satu sistem.

Setelah News dan Media, kamu kerjakan Gallery. Gallery cenderung berat karena visual, lightbox, lazy-load, dan layout yang harus tetap enak di mobile. Kalau kamu taruh Gallery terlalu awal, kamu bisa kejebak optimasi gambar sebelum fondasi portal dan typography benar. Kalau kamu taruh setelah Media/News, kamu sudah punya pola list-detail yang matang, tinggal kamu naikkan levelnya ke visual grid.

Team dan Contact paling enak dikerjakan setelah itu, tapi Contact sebenarnya boleh kamu “selipkan” lebih cepat kalau kamu butuh CTA secepatnya. Namun dari sisi risiko, Contact itu mudah begitu template 2D sudah jadi: kamu tinggal bikin form glassy yang jelas, state sukses/gagal, dan integrasi link sosial. Team juga relatif mudah begitu kamu punya kartu dan layout grid. Karena itu, keduanya tidak perlu menghambat fase awal; mereka bagus sebagai “penutup yang melengkapi” setelah inti konten dan sistem transisi sudah mapan.

Terakhir, panel ekstra seperti About, Community, Careers, Roadmap, Status, Support itu paling aman dikerjakan paling belakang karena mereka kebanyakan memanfaatkan komponen yang sudah ada. Roadmap dan Status bisa kamu buat keren (timeline, badge status), tapi mereka tidak perlu jadi prioritas sebelum Projects/Game/Docs sudah terasa solid.

Kalau aku rangkum dalam rasa alurnya: kamu mengunci dulu “mesin dimensi” (portal + shell + 2D atmosphere), lalu kamu uji kenyamanan baca paling ekstrem (Docs), lalu kamu isi identitas studio (Projects), lalu kamu kunci jalur hero dari semesta (Game → store), baru setelah itu kamu memperluas konten yang rutin dan visual-heavy (News/Media/Gallery), lalu kamu rapikan sisi human dan CTA (Team/Contact), dan terakhir melengkapi semua halaman tambahan.

---

Oke. Ini “kontrak konten” (content contract) untuk setiap halaman prioritas yang kita sepakati, ditulis sebagai blueprint yang bisa kamu pakai berulang: struktur, komponen wajib, perilaku, dan kaitannya dengan Portal Profiles. Tujuannya: kamu bisa bikin banyak halaman tanpa tiap kali mikir ulang layout, dan semua tetap terasa satu semesta.

Aku urutkan sesuai prioritas yang tadi: Shell + Portal + 2D Template (sebagai basis), lalu Docs, Projects, Game panel (store), News, Media, Gallery, Team, Contact. Panel ekstra aku taruh di akhir sebagai template turunan.

---

# Kontrak Global: App Shell + Portal + 2D Template

## 1) App Shell Contract

Semua halaman, baik 3D maupun 2D, harus hidup di satu “shell” yang tidak pernah mati, supaya portal tidak pernah patah.

Elemen permanen:

* PortalOverlay selalu berada di layer paling atas.
* Audio policy (kalau ada SFX) di-handle di shell.
* Router/route state di-handle di shell, bukan di masing-masing page.

Kontrak perilaku:

* Setiap navigasi keluar realm 3D harus melalui FocusPreview 0.28 detik, lalu PortalOut sesuai profile, lalu swap route, lalu PortalFade.
* Setiap navigasi balik ke 3D lewat Back to Galaxy harus melalui mini preview 2D 0.24–0.30 detik, lalu PortalReverse, lalu resume 3D.

Kontrak performa:

* GalaxyCanvas saat di 2D tidak di-unmount, tetapi di-pause (render loop berhenti) dan state yaw/pitch disimpan, supaya balik instan.
* 2D page harus punya “minimal ready” skeleton agar portal swap tidak pernah menampilkan blank.

## 2) PortalOverlay Contract

PortalOverlay wajib punya:

* Mode: portalOut, portalIn (reverse), dan micro-portal (opsional untuk internal 2D section jump).
* Profile: docs, projects, team, gallery, media, news, contact, store, utility.
* Timeline: FocusPreview 0.28 detik → PortalOut 0.55–0.92 detik → Swap → PortalFade 0.20–0.35 detik.

Kontrak visual:

* Portal lahir dari elemen sumber (panel frame / video frame / tombol).
* Ada ring energi awal + distort halus, lalu streak, lalu puncak flash singkat, lalu meluruh.

Kontrak swap:

* Swap route hanya terjadi ketika target “minimal ready”.
* Jika belum ready, portal menahan puncak sebentar dengan motion tetap bergerak halus.

## 3) 2D Background + Layout Contract

Semua halaman 2D wajib memiliki:

* Background starfield halus, intensitas rendah.
* Black hole sliver di kiri (12–18% lebar) yang memudar panjang ke kanan.
* Content Surface utama (glassy) agar teks terbaca.
* Header sticky glassy: Back to Galaxy + breadcrumb + (opsional) aksi konteks.
* Footer halus.

Kontrak typography:

* Heading/display font boleh hologram-feel (tracking sedikit, glow minimal).
* Body font harus super readable, tanpa glow, line-height lega.
* Link punya aksen cyan default; aksen profile hanya untuk highlight section tertentu (mis. News amber, Contact green).

---

# Kontrak Halaman 1: Docs (Prioritas #1)

Docs adalah halaman “uji baca panjang”. Kalau Docs nyaman, semua halaman lain gampang.

## Struktur halaman Docs

Header (sticky):

* Back to Galaxy (selalu ada).
* Breadcrumb: Docs > Section > Page.
* Search docs (opsional tapi bagus) di kanan.

Layout body:

* Sidebar kiri (collapsible):

  * Tree navigation (Sections & pages).
  * Penanda halaman aktif.
* Main content:

  * Title H1.
  * Metadata kecil (last updated, reading time).
  * Table of Contents (TOC) untuk halaman panjang (sticky dalam main).
  * Content blocks.
* Right rail (opsional):

  * “On this page” TOC kalau kamu mau versi 3-kolom di desktop besar.

## Komponen konten yang wajib didukung

* Heading H2/H3/H4 dengan anchor link.
* Paragraph, list, blockquote (callout).
* Code block dengan copy button.
* Inline code.
* Table (untuk docs data).
* Image/diagram dengan caption.
* Callout box: Note / Warning / Tip (hologram border beda).
* “Next / Previous” navigation di bawah.

## Portal profile

Masuk Docs dari 3D: Profile “Blueprint Tunnel” (cyan-biru, grid halus, streak rapi).
Keluar ke 3D: reverse profile yang sama.

## Aturan UX penting

* Tidak boleh ada animasi background yang bergerak banyak (docs harus stabil).
* Scroll harus halus; header berubah solid saat scroll.
* Anchor jump (klik TOC) harus smooth tapi tidak berlebihan.

---

# Kontrak Halaman 2: Projects (Prioritas #2)

Projects adalah identitas studio. Kontraknya harus mendukung: list → filter → detail.

## Struktur halaman Projects (List)

Header:

* Back to Galaxy.
* Breadcrumb: Projects.
* Filter bar (di kanan atau bawah breadcrumb): tag, status, tahun.

Body:

* Project grid (cards) dengan ukuran konsisten.
* Each card:

  * Thumbnail (atau loop video 2–3 detik versi ringan).
  * Title.
  * Short one-liner.
  * Tags (max 3 terlihat, sisanya “+n”).
  * Status badge (Released / WIP / Prototype).
  * CTA kecil “Open”.

Footer list:

* Pagination atau infinite scroll (pilih satu; untuk awal pagination lebih aman).

## Struktur halaman Project Detail

Header:

* Back to Galaxy.
* Breadcrumb: Projects > Project Name.

Body:

* Hero section:

  * Cover media (image/video) lebar.
  * Title + subtitle.
  * Quick facts (role, tech stack, date, platform).
  * CTA external (jika ada).
* Content sections:

  * Overview.
  * What we did.
  * Screenshots (gallery strip).
  * Tech details (optional).
  * Links (GitHub, demo, docs).
* Related projects (3–6 cards).

## Portal profile

Masuk Projects: “Assembler” (modular blocks + streak).
Masuk Project Detail dari list: boleh micro-portal ringan atau transisi card expand (lebih nyaman).
Balik ke list: reverse.

## Aturan UX penting

* Cards harus punya hover hologram (glow tipis + raise).
* Filter harus instan (tanpa reload).
* Thumbnail jangan berat; gunakan poster + hover preview opsional.

---

# Kontrak Panel 3: Game Panel di 3D (Store Download)

Ini bukan halaman 2D utama, tapi panel hero di galaxy.

## Struktur saat Game panel difokuskan (FocusPanelMode penuh)

Area atas: Video frame (16:9)

* Autoplay silent loop pendek (atau play on click).
* Poster fallback.
* Overlay kecil: title + status.

Area bawah: Description

* One-liner hook.
* Deskripsi pendek 2–4 kalimat.
* Tags (genre/platform).
* Tombol store:

  * Steam
  * itch.io
  * Play Store
    (tampil sesuai ketersediaan)

## Kontrak tombol store

Saat tombol store ditekan:

* Selalu FocusPreview 0.28 detik pada video frame (bukan teks).
* Deskripsi memudar cepat.
* Video frame membesar (screen expand).
* PortalOut profile “Download Dive”.
* Buka link eksternal.

## Portal eksternal: aturan premium

* Ideal: buka tab baru supaya portal bisa selesai di tab utama dan user bisa balik.
* Jika tab sama: portal dipercepat dan redirect terjadi tepat setelah flash.

## Visual profile “Download Dive”

* Streak paling padat, aksen hijau-putih.
* HUD hint singkat “LINK START / DOWNLOAD”.
* Flash puncak tegas tapi singkat.

---

# Kontrak Halaman 4: News (List + Detail)

News membuat web terasa hidup. Kontrak harus ringan, cepat, dan konsisten.

## Struktur News List

Header:

* Back to Galaxy.
* Breadcrumb: News.
* Filter: category (Update / Release / Devlog / Event).

Body:

* Feed items sebagai cards:

  * Date.
  * Title.
  * Snippet 1–2 baris.
  * Category badge.
  * “Read” CTA.

## Struktur News Detail

Header:

* Back to Galaxy.
* Breadcrumb: News > Post.

Body:

* Title + date + tags.
* Hero image (optional).
* Konten artikel (readable).
* Related posts.

## Portal profile

News: “Ticker Rush” (amber, streak cepat + hint ticker).
Tapi background 2D tetap tenang; profile hanya muncul di portal, bukan di seluruh halaman.

---

# Kontrak Halaman 5: Media (Video list + Press Kit)

Media beda dari News: lebih “showcase”.

## Struktur Media

Header:

* Back to Galaxy.
* Breadcrumb: Media.

Body:

* Tabs atau sections:

  * Trailers
  * Teasers
  * Press Kit (download assets)
* Video list:

  * Thumbnail
  * Duration
  * Title
  * Short description
  * Play inline / open modal

Press kit:

* Asset cards (logo, key art, screenshots pack).
* Download buttons.

Portal profile
Media: “Filmstrip Jump” (frame-strip hint + streak).

---

# Kontrak Halaman 6: Gallery (Visual heavy)

Gallery harus hemat performa dan punya lightbox yang bagus.

## Struktur Gallery

Header:

* Back to Galaxy.
* Breadcrumb: Gallery.
* Filter: type (Concept / Screenshot / Fanart / UI / etc).

Body:

* Masonry grid (lazy-load).
* Hover: overlay title + tag.
* Click: lightbox modal:

  * Image besar
  * Caption
  * Next/Prev
  * Download link (optional)

Portal profile
Gallery: “Shutter Warp” (aperture sweep + sparkle halus).

Aturan performa:

* Lazy load + responsive images wajib.
* Hindari animasi berat di grid.

---

# Kontrak Halaman 7: Team

Team harus human, tetapi tetap hologram.

## Struktur Team

Header:

* Back to Galaxy.
* Breadcrumb: Team.

Body:

* Team intro singkat.
* Grid profile cards:

  * Foto (atau avatar)
  * Nama
  * Role
  * Short bio
  * Social links (icons)
* Optional: timeline / values

Portal profile
Team: “Heartbeat” (pulse ring halus, magenta lembut).

---

# Kontrak Halaman 8: Contact

Contact harus paling usable.

## Struktur Contact

Header:

* Back to Galaxy.
* Breadcrumb: Contact.

Body:

* Contact methods:

  * Email
  * Social
  * Business inquiries
* Form:

  * Name
  * Email
  * Subject
  * Message
  * Submit
* Feedback state:

  * Loading
  * Success
  * Error

Portal profile
Contact: “Signal Gate” (hijau neon, wave signal).

Aturan UX:

* Error state jelas, jangan glow doang.
* Submit harus punya feedback visual yang tegas.

---

# Kontrak Halaman Tambahan (Utility)

About / Community / Careers / Roadmap / Status / Support bisa memakai template yang sama, tinggal variasi kontennya.

Profile default: “Utility Jump” (turunan Blueprint Tunnel, lebih ringan).

Roadmap:

* Timeline blocks (milestone).
  Status:
* Badge status + uptime.
  Support:
* FAQ accordion + report bug link.
  Community:
* Link komunitas + highlight events.
  Careers:
* List posisi + apply link.

---

## Bonus: Kontrak Breadcrumb dan Back to Galaxy (harus seragam)

Breadcrumb selalu:

* Menunjukkan jalur, tidak lebih dari 4 level terlihat.
* Jika lebih, compress tengah jadi “…” yang bisa diklik (opsional).
* Item terakhir (active) paling terang.

Back to Galaxy selalu:

* Ada di kiri atas, selalu bisa diakses.
* Memicu portal reverse, bukan sekadar route swap.

---

Sip. Ini sitemap + naming route yang rapi (scalable untuk “banyak halaman”), sekaligus aturan mapping “Portal Profile” otomatis per route, biar kamu tidak mikir lagi setiap kali nambah halaman: cukup taruh file/route di tempat yang benar, portalnya otomatis pakai style yang sesuai.

---

# Sitemap global: dua realm, satu sistem

Kita bagi URL jadi 2 kelompok besar, tapi tetap satu app.

Realm 3D (Galaxy) adalah home.
Realm 2D (Pages) adalah konten baca/lihat/aksi yang jumlahnya banyak.

Kontraknya: user selalu bisa balik ke Galaxy lewat tombol Back to Galaxy, dan setiap perpindahan realm memakai FocusPreview 0.28 detik + portal.

---

## A. Realm 3D (Galaxy)

* `/`
  Landing Galaxy (default POV, black hole sliver kiri, ring panel, zodiac).

Opsional (kalau kamu mau route eksplisit untuk 3D):

* `/galaxy`
  Alias dari `/` (berguna untuk “Back to Galaxy” yang konsisten).

Kalau kamu ingin deep-link ke state tertentu di galaxy (opsional, tapi powerful):

* `/?focus=game` (atau hash `#/focus/game`)
  Membuka focus panel tertentu saat masuk galaxy.
* `/?yaw=-35`
  Mengarahkan kamera sedikit ke kiri agar black hole terlihat jelas.
  Ini opsional, tapi bagus untuk share link.

---

## B. Realm 2D (Pages)

### 1) Docs (bisa sangat banyak)

* `/docs`
  Docs home / index.
* `/docs/:section`
  Section list (misal `engine`, `art`, `pipeline`).
* `/docs/:section/:page`
  Halaman docs detail.
* `/docs/:section/:page/:subpage`
  Kalau butuh level lebih dalam.

Rekomendasi struktur naming:

* gunakan slug lowercase, dash: `getting-started`, `shader-guide`, `build-pipeline`.

Contoh:

* `/docs/engine/getting-started`
* `/docs/engine/black-hole-shader`
* `/docs/pipeline/release-checklist`

### 2) Projects (list + detail)

* `/projects`
  List.
* `/projects/:projectSlug`
  Detail project.
* `/projects/:projectSlug/changelog` (opsional)
* `/projects/:projectSlug/media` (opsional)

Contoh:

* `/projects/ophius-studio-site`
* `/projects/black-hole-environment`

### 3) Games (sebagai katalog 2D opsional)

Walaupun Game panel ada di galaxy, katalog 2D berguna untuk SEO + list lengkap.

* `/games`
  List semua game.
* `/games/:gameSlug`
  Detail game (trailer + deskripsi + tombol store).
* `/games/:gameSlug/download` (opsional)
  Halaman ringan yang hanya berisi tombol store (kalau kamu mau CTA cepat).

Contoh:

* `/games/astral-sentinel`
* `/games/astral-sentinel/download`

Catatan: klik “Steam/itch/Play Store” tetap eksternal, tapi halaman ini bagus sebagai “hub” sebelum keluar.

### 4) News (feed + detail)

* `/news`
* `/news/:postSlug`

Contoh:

* `/news/devlog-01`
* `/news/release-notes-2026-01`

### 5) Media (video + press kit)

* `/media`
* `/media/trailers`
* `/media/press-kit`
* `/media/:mediaSlug` (opsional detail item)

### 6) Gallery (visual heavy)

* `/gallery`
* `/gallery/:collectionSlug` (opsional)
* `/gallery/:collectionSlug/:itemSlug` (opsional deep link ke lightbox)

Contoh:

* `/gallery/concept-art`
* `/gallery/concept-art/nebula-gate`

### 7) Team

* `/team`
* `/team/:memberSlug` (opsional)

### 8) Contact

* `/contact`
* `/contact/business` (opsional)
* `/contact/support` (opsional kalau kamu pisah)

### 9) Utility pages (tambahan yang tadi)

* `/about`
* `/community`
* `/careers`
* `/careers/:roleSlug` (opsional)
* `/roadmap`
* `/status`
* `/support`
* `/support/:topicSlug` (opsional)

---

# Naming rules biar tidak chaos saat halaman makin banyak

Aturan slug:

* lowercase
* pakai dash `-`
* hindari underscore
* hindari tanggal di slug kecuali news

Aturan content ID internal (untuk data):

* `type/slug` misalnya `docs/engine/getting-started`, `projects/ophius-site`, `news/devlog-01`.

Ini memudahkan mapping portal profile dan analytics.

---

# Breadcrumb contract otomatis

Breadcrumb generator aturan sederhana:

* `/docs/...` → `Docs > {Section} > {Page}`
* `/projects/...` → `Projects > {Project}`
* `/games/...` → `Games > {Game}`
* `/news/...` → `News > {Post}`
* `/media/...` → `Media > {Tab atau Item}`
* `/gallery/...` → `Gallery > {Collection} > {Item}`
* sisanya → `{PageName}`

Setiap halaman boleh override displayName (misal “Black Hole Shader” bukan slug).

---

# Portal Profile mapping otomatis per route

Ini bagian kuncinya: kamu tidak memilih profile manual tiap klik. Router/PortalOverlay membaca destination route dan menentukan profile.

Mapping dasar:

* Route mulai dengan `/docs` → Profile: `docs` (Blueprint Tunnel)
* Route mulai dengan `/projects` → Profile: `projects` (Assembler)
* Route mulai dengan `/team` → Profile: `team` (Heartbeat)
* Route mulai dengan `/gallery` → Profile: `gallery` (Shutter Warp)
* Route mulai dengan `/media` → Profile: `media` (Filmstrip Jump)
* Route mulai dengan `/news` → Profile: `news` (Ticker Rush)
* Route mulai dengan `/contact` → Profile: `contact` (Signal Gate)
* Route mulai dengan `/games` → Profile: `media` atau `storeHub`

  * rekomendasi: `media` untuk halaman game detail (karena video/trailer heavy)
  * tombol store eksternal tetap pakai `store`
* Route utility (`/about`, `/community`, `/careers`, `/roadmap`, `/status`, `/support`) → Profile: `utility`

Mapping eksternal link:

* steam / itch / playstore / appstore → Profile: `store` (Download Dive)
* github / docs external / notion → Profile: `docs` atau `utility` (pilih salah satu, konsisten)
* youtube / vimeo → Profile: `media`

---

# Aturan “FocusPreview 0.28 detik” untuk semua navigasi

Kontrak klik panel (3D → 2D route):

* selalu preview fokus 0.28 detik (panel maju sedikit, glow naik, panel lain meredup tipis)
* lalu portal out sesuai profile destination
* swap route saat target minimal ready
* portal fade
* halaman 2D tampil

Kontrak klik link internal di 2D (2D → 2D):

* untuk perpindahan besar antar section (misal Docs → Projects), boleh pakai portal penuh
* untuk navigasi kecil di dalam section (Docs page next/prev), pakai micro-portal ringan atau transisi konten biasa (lebih nyaman)

Ini menjaga gaya kamu tetap keren tanpa membuat user capek.

---

# Kontrak “Back to Galaxy” dan “masuk ke Galaxy”

Back to Galaxy selalu menuju `/` (atau `/galaxy` alias), portal reverse aktif, dan galaxy resume yaw/pitch terakhir.

Kalau kamu ingin “balik selalu ke landing default” (yaw 0) itu bisa jadi setting, tapi rekomendasi premium adalah: balik ke yaw/pitch terakhir, karena terasa semesta itu “persist”.

---

# Bonus: struktur folder konten biar gampang mainten

Kalau kamu pakai content markdown/MDX untuk Docs/News:

* `content/docs/<section>/<page>.mdx`
* `content/news/<YYYY>/<postSlug>.mdx`
* `content/projects/<projectSlug>.json` (atau mdx)
* `content/games/<gameSlug>.json`
* `content/media/...`
* `content/gallery/...`

Dengan ini, sitemap dan breadcrumb bisa digenerate otomatis dari filesystem/data, bukan ditulis manual.

---

Siap. Ini **Routing & Portal Decision Table** yang super eksplisit untuk **8 panel inti** kamu (Game, Project, Team, Docs, Gallery, Media, News, Contact), termasuk asal klik (dari galaxy/orbit vs dari focus panel vs dari 2D), tujuan, profile portal, style portal, dan aturan buka tab baru untuk link eksternal. Ini kamu bisa jadikan “dokumen pegangan coding” biar behavior selalu konsisten.

---

# Aturan global (berlaku untuk semua baris tabel)

Semua navigasi “keluar realm saat ini” selalu punya ritme:
**FocusPreview 0.28s → PortalOut (profile by destination) → Swap (saat minimal ready) → PortalFade 0.22–0.35s**.

Back to Galaxy selalu:
**MiniPreview 0.26s → PortalReverse (profile by source) → Swap ke `/` → PortalFade**.

Portal lahir dari elemen sumber:

* Dari panel 3D: portal origin = panel frame (atau video frame untuk Game).
* Dari header/back button 2D: portal origin = tombol Back to Galaxy (atau surface content center).

Durasi default:

* Internal 3D→2D: total ~1.05s (preview 0.28 + portal ~0.77).
* External store link: total ~0.92s (preview 0.28 + portal ~0.64).

Minimal ready:

* Halaman 2D minimal sudah render header + container + skeleton, baru swap dianggap aman.

External link policy (default premium):

* **Buka tab baru** untuk Steam/itch/Play Store, supaya portal di tab utama selesai dan semesta tidak “kepotong”.

---

# Decision Table A — Klik panel dari Galaxy Explore (panel kecil di orbit)

Ini kasus paling sering di landing: user klik panel yang melayang 360°.

| Origin State   | Click Target      | FocusPreview? | Destination                 | Portal Profile             | Portal Style              | Open in new tab? | Notes penting                                                      |
| -------------- | ----------------- | ------------: | --------------------------- | -------------------------- | ------------------------- | ---------------: | ------------------------------------------------------------------ |
| Galaxy Explore | Game panel (card) |    Ya (0.28s) | Galaxy FocusPanelMode: Game | *Tidak pakai portal besar* | Cinematic zoom (in-realm) |            Tidak | Ini bukan keluar realm; ini membuka panel besar (video+deskripsi). |
| Galaxy Explore | Project panel     |    Ya (0.28s) | `/projects`                 | projects                   | Assembler                 |            Tidak | Setelah portal selesai, user masuk Projects list 2D.               |
| Galaxy Explore | Team panel        |    Ya (0.28s) | `/team`                     | team                       | Heartbeat                 |            Tidak | Team 2D page.                                                      |
| Galaxy Explore | Docs panel        |    Ya (0.28s) | `/docs`                     | docs                       | Blueprint Tunnel          |            Tidak | Docs index 2D.                                                     |
| Galaxy Explore | Gallery panel     |    Ya (0.28s) | `/gallery`                  | gallery                    | Shutter Warp              |            Tidak | Gallery 2D (visual heavy).                                         |
| Galaxy Explore | Media panel       |    Ya (0.28s) | `/media`                    | media                      | Filmstrip Jump            |            Tidak | Media 2D.                                                          |
| Galaxy Explore | News panel        |    Ya (0.28s) | `/news`                     | news                       | Ticker Rush               |            Tidak | News feed 2D.                                                      |
| Galaxy Explore | Contact panel     |    Ya (0.28s) | `/contact`                  | contact                    | Signal Gate               |            Tidak | Contact 2D.                                                        |

Catatan: Game panel dari orbit **selalu masuk FocusPanelMode dulu**, bukan langsung ke store. Karena kamu mau bentuknya “video + deskripsi” sebelum memilih store.

---

# Decision Table B — Dari Galaxy FocusPanelMode: Game (panel besar)

Ini flow spesifik yang kamu minta: video di atas, deskripsi di bawah, tombol store.

| Origin State        | Click Target              |                  FocusPreview? | Destination               | Portal Profile        | Portal Style                 | Open in new tab? | Notes penting                                                                        |
| ------------------- | ------------------------- | -----------------------------: | ------------------------- | --------------------- | ---------------------------- | ---------------: | ------------------------------------------------------------------------------------ |
| Game FocusPanelMode | Tombol Steam              | Ya (0.28s, origin=video frame) | External: Steam URL       | store                 | Download Dive                |     Ya (default) | Deskripsi memudar cepat; video frame jadi portal frame (screen expand) → Link Start. |
| Game FocusPanelMode | Tombol itch.io            | Ya (0.28s, origin=video frame) | External: itch URL        | store                 | Download Dive                |     Ya (default) | Sama.                                                                                |
| Game FocusPanelMode | Tombol Play Store         | Ya (0.28s, origin=video frame) | External: Play Store URL  | store                 | Download Dive                |     Ya (default) | Sama.                                                                                |
| Game FocusPanelMode | “More details” (opsional) |                     Ya (0.28s) | `/games/:gameSlug`        | media (atau storeHub) | Filmstrip Jump (lebih halus) |            Tidak | Ini kalau kamu mau 2D detail game untuk SEO/daftar lengkap.                          |
| Game FocusPanelMode | Close / Back              |               Tidak (langsung) | Kembali ke Galaxy Explore | *in-realm*            | Reverse zoom                 |            Tidak | Bukan keluar realm.                                                                  |

---

# Decision Table C — Dari halaman 2D: klik Back to Galaxy

Berlaku untuk semua halaman 2D.

| Origin Page                                   | Click Target   | MiniPreview? | Destination  | Portal Profile    | Portal Style | Notes penting                                                                                        |
| --------------------------------------------- | -------------- | -----------: | ------------ | ----------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| Docs/Projects/Team/Gallery/Media/News/Contact | Back to Galaxy |   Ya (0.26s) | `/` (Galaxy) | profile by source | Reverse      | Profile reverse mengikuti halaman asal: Docs→docs, News→news, dst. Galaxy resume yaw/pitch terakhir. |

---

# Decision Table D — Navigasi 2D ke 2D (antar section besar)

Ini untuk link besar di header, breadcrumb root, atau CTA antar halaman (misal dari News ke Projects).

| Origin Page | Click Target                                          |                               FocusPreview? | Destination     | Portal Profile | Portal Style     | Notes penting                                                                 |
| ----------- | ----------------------------------------------------- | ------------------------------------------: | --------------- | -------------- | ---------------- | ----------------------------------------------------------------------------- |
| Any 2D      | Link ke Docs/Projects/News/Media/Gallery/Team/Contact | Ya (0.22–0.30s pada content surface/header) | Target route 2D | by destination | PortalOut ringan | Pakai portal untuk perpindahan besar antar section biar rasa tetap konsisten. |

Untuk navigasi kecil **di dalam** section (contoh: next/prev di Docs, pagination), jangan pakai portal penuh; cukup micro fade/slide supaya tidak melelahkan.

---

# Decision Table E — Breadcrumb behavior (2D)

Breadcrumb itu “internal nav”. Aturan biar konsisten:

| Breadcrumb Click                       | Portal?                  | Profile | Notes                                                                |
| -------------------------------------- | ------------------------ | ------- | -------------------------------------------------------------------- |
| Klik root section (mis. “Docs”)        | Portal ringan            | docs    | Perpindahan besar (subpage → index).                                 |
| Klik intermediate (mis. Docs > Engine) | Portal ringan atau micro | docs    | Jika load berat, portal ringan lebih aman; jika ringan, micro cukup. |
| Klik current page                      | Tidak                    | —       | Tidak melakukan apa-apa.                                             |

---

# Decision Table F — Source-of-truth profile mapping (single rule)

Profile ditentukan oleh destination:

* `/docs...` → docs (Blueprint Tunnel)
* `/projects...` → projects (Assembler)
* `/team...` → team (Heartbeat)
* `/gallery...` → gallery (Shutter Warp)
* `/media...` → media (Filmstrip Jump)
* `/news...` → news (Ticker Rush)
* `/contact...` → contact (Signal Gate)
* External store domains (Steam/itch/Play) → store (Download Dive)

Dengan aturan ini, kamu tidak pernah hardcode per tombol kecuali external store (karena itu bukan route).

---

# Default keputusan “tab baru” untuk eksternal

Untuk Steam/itch/Play Store:

* Default: **tab baru**.
* Kalau user pengin “stay in same tab”: kamu tetap jalankan preview 0.28s + portal sampai flash puncak, lalu redirect di tab yang sama (portal tidak perlu fade panjang).

Kontrak UX:

* Beri hint kecil “Opens in new tab” di label tombol store (ikon ↗ kecil) agar tidak bikin user kaget.

---

# Checklist konsistensi (biar tidak ada behavior nyeleneh)

Setiap panel inti:

* Klik dari orbit selalu memunculkan preview fokus 0.28s.
* Semua panel kecuali Game langsung keluar ke 2D route.
* Game dari orbit selalu masuk ke Game FocusPanelMode (video+deskripsi).
* Store button selalu origin portal = video frame dan profile = store.
* Back to Galaxy selalu tersedia di 2D dan selalu portal reverse.

---

Siap. Ini **spec micro-interaction per panel** yang konsisten dengan portal profile masing-masing, supaya sejak pertama kali user hover/tap, mereka sudah “ngeh” karakter panelnya. Aku bikin ini sebagai kontrak perilaku + parameter rasa (durasi, intensitas, feedback), bukan sekadar ide umum.

---

# Kontrak global micro-interaction (berlaku untuk semua panel 3D)

Panel interaktif selalu punya 4 lapis feedback yang konsisten:

1. **Hover/Focus lighting**: edge glow + sedikit brighten isi panel
2. **Kinetik**: naik sedikit dari orbit + tilt kecil (bukan hanya scale)
3. **Signal**: cursor berubah / tap feedback / subtle audio hint (opsional)
4. **Readability assist**: panel sedikit “menghadap” kamera saat di-highlight

Semua panel wajib punya 4 state ini:

* **Idle** (normal orbit)
* **Hover** (desktop pointer di atas panel)
* **Pressed** (mouse down / tap down)
* **Selected/Preview** (FocusPreview 0.28s sebelum portal)

Durasi dasar (bisa sedikit berbeda per profile, tapi ini baseline):

* Idle → Hover: 140–180 ms (cepat, responsif)
* Hover → Idle: 220–300 ms (lebih pelan, elegan)
* Hover → Pressed: 60–90 ms (snappy)
* Pressed → Hover: 120–160 ms (bounce ringan)
* Selected/Preview: 280 ms fixed (ini signature)

“Gerak” panel saat Hover:

* **Lift**: panel maju ke arah kamera sekitar kecil (rasa floating)
* **Tilt**: rotasi mikro mengikuti posisi pointer (desktop) atau arah kamera (mobile)

Aturan anti “nindih klik”:

* Hanya mesh panel (dan tombol interaktif yang kamu definisikan) yang menerima event.
* Dekor, partikel, glow mesh dummy tidak boleh menangkap pointer.

---

# Parameter visual yang konsisten dengan semesta (hologram readable)

Semua panel punya:

* Background translucent gelap (glass)
* Edge outline tipis
* Noise/scanline halus (sangat kecil)
* Inner highlight yang hanya muncul saat Hover/Selected

Tetapi tiap panel punya “aksen warna” yang berbeda sesuai portal profile. Aksen ini **tidak** memenuhi panel; hanya dipakai untuk edge glow, indicator kecil, dan highlight garis tipis. Body tetap netral agar tetap satu semesta.

---

# Cursor & tap language (biar jelas “yang bisa dipencet yang mana”)

Desktop:

* Idle panel: cursor default
* Hover panel: cursor jadi pointer + ada “halo ring” kecil di dekat cursor (opsional tapi keren)
* Pressed: ring menyusut cepat (seperti click feedback)
* Selected/Preview: cursor dikunci (opsional) agar terasa “system engaged”

Mobile:

* Tap panel: panel “press” (sedikit masuk lalu bounce)
* Haptic (kalau didukung): micro haptic saat Pressed dan saat PortalStart

---

# Audio hint (opsional tapi bikin mahal)

Kalau kamu pakai audio, pakai aturan:

* Hover: bunyi “tick” lembut, sangat pelan (jangan tiap hover spam; kasih cooldown 600–900 ms per panel)
* Pressed: bunyi “confirm” pendek
* PortalStart: bunyi “whoosh / link start” sesuai profile

Audio per profile beda karakter, tetapi volumenya kecil. PortalStart adalah yang paling terdengar.

---

# Spec per panel inti (8 panel kamu)

## 1) Game (Hero panel, karakter “cinematic portal”)

Aksen: putih-biru dengan sedikit emerald hint saat siap masuk store
Idle:

* Thumbnail video preview sangat halus (loop pendek) tapi brightness rendah
* Edge glow minimal

Hover:

* Video preview brightness naik sedikit
* Edge glow naik, ada shimmer tipis di pojok (seperti “screen”)
* Lift sedikit lebih besar dari panel lain (karena hero)

Pressed:

* Video frame “snap” halus (1 frame seperti flash kecil)
* Panel bounce lebih “weighty” (kesan layar)

Selected/Preview 0.28s:

* Panel menghadap kamera lebih tegas
* “Screen expand” micro (bukan full portal) sebagai konfirmasi
* Di akhir preview, jika aksi menuju FocusPanelMode: muncul hint tombol “Open” kecil (opsional)

Khusus saat tombol store ditekan (di Game FocusPanelMode):

* Origin portal = video frame
* Deskripsi memudar cepat
* Border video jadi “portal ring” (energi)
* Aksen hijau muncul sesaat sebagai tanda “download dive”

## 2) Projects (Profile Assembler: modular, card-stack)

Aksen: biru-ungu (modular)
Idle:

* Ada “grid micro-dots” tipis di dalam panel (hampir tak terlihat)

Hover:

* Muncul garis modular seperti outline kartu kecil di dalam (2–3 garis)
* Edge glow naik, tapi rapi (tidak shimmer liar)
* Tilt mengikuti pointer (seolah kartu fisik)

Pressed:

* Ada efek “card click” (panel sedikit compress, bukan hanya scale)
* Highlight garis modular berkedip 1x

Selected/Preview:

* Panel maju lebih jelas, lalu muncul 2–3 “ghost cards” di belakangnya (opacity rendah) selama preview
* Itu mengirim sinyal: “ini kumpulan project”

## 3) Team (Profile Heartbeat: human, pulse lembut)

Aksen: magenta lembut (jangan neon)
Idle:

* Panel terasa paling “soft”: edge glow paling kecil

Hover:

* Ada pulse ring tipis yang expand pelan sekali dari tengah panel (sekali saja)
* Lift kecil, tilt lebih kecil daripada panel lain (lebih kalem)

Pressed:

* Pulse lebih cepat 1x (seperti heartbeat)
* Edge glow naik sebentar lalu stabil

Selected/Preview:

* Panel menghadap kamera + muncul “silhouette highlight” lembut di background panel (abstrak, bukan foto dulu)

## 4) Docs (Profile Blueprint Tunnel: teknis, rapi)

Aksen: cyan-biru
Idle:

* Ada garis blueprint super halus (grid) di dalam panel tapi sangat redup

Hover:

* Grid terlihat sedikit lebih jelas
* Muncul “corner markers” (seperti bracket teknik) di 4 sudut panel
* Edge glow cyan naik, sangat bersih

Pressed:

* Corner markers “mengunci” (sedikit bergerak masuk)
* Ada micro “scan” garis horizontal 1x

Selected/Preview:

* Panel maju + grid jadi lebih tegas
* Di akhir preview, corner markers berubah jadi ring portal tipis (hint portal) sebelum transisi keluar ke 2D docs

## 5) Gallery (Profile Shutter Warp: lensa, sparkle halus)

Aksen: putih dengan emas tipis (sangat hemat)
Idle:

* Thumbnail statis atau very slow parallax (kalau ada)

Hover:

* Ada efek “aperture sweep” kecil: satu arc tipis melintas (bukan animasi besar)
* Sparkle halus di edge (jangan banyak)
* Lift medium

Pressed:

* Aperture snap cepat (seolah shutter)
* Border glow naik sedikit

Selected/Preview:

* Panel maju + aperture ring terlihat selama preview
* Menjelang portal, aperture ring “menutup” sedikit lalu portal keluar ke 2D gallery

## 6) Media (Profile Filmstrip Jump: cinematic, frame-strip)

Aksen: biru dengan amber tipis
Idle:

* Ada “frame perforation” tipis (seperti film) di sisi kiri/kanan panel, sangat redup

Hover:

* Frame perforation jadi sedikit terlihat
* Ada micro “filmstrip slide” 1x (gerak 8–12 px di texture)
* Lift medium

Pressed:

* Efek “play cue” muncul (ikon kecil) lalu hilang cepat
* Edge glow naik

Selected/Preview:

* Panel maju + filmstrip elements menjadi jelas sesaat, lalu portal out profile media

## 7) News (Profile Ticker Rush: cepat, informatif)

Aksen: amber-oranye (kontras tapi jangan menyilaukan)
Idle:

* Ada garis ticker tipis di bawah panel (seperti underline)

Hover:

* Garis ticker bergerak cepat 1x (seolah update)
* Edge glow amber naik
* Lift kecil tapi “snappy” (lebih responsif daripada yang lain)

Pressed:

* Ticker “snap” (garis jadi tebal 1 frame)
* Panel bounce cepat

Selected/Preview:

* Panel maju + muncul micro label “LIVE/UPDATE” (opsional)
* Lalu portal out ke /news

## 8) Contact (Profile Signal Gate: sinyal, tegas, CTA)

Aksen: hijau neon (tapi controlled)
Idle:

* Panel terlihat paling “call-to-action”: outline sedikit lebih tegas dari yang lain

Hover:

* Muncul wave signal tipis (2 gelombang) yang melebar dari sisi kiri ke kanan
* Edge glow hijau naik
* Lift medium

Pressed:

* Wave signal jadi lebih kuat 1x (lalu turun)
* Ada micro “confirm” highlight di center

Selected/Preview:

* Panel maju + wave berubah jadi ring gate tipis
* Portal out ke /contact

---

# Kunci “konsistensi rasa” antar panel (biar tidak jadi sirkus)

* Docs dan Projects harus terlihat paling “rapi” (geometris).
* News harus terasa paling “cepat”.
* Contact harus terasa paling “tegas/CTA”.
* Team harus paling “soft/human”.
* Gallery dan Media harus paling “cinematic”.
* Game adalah “hero portal”, paling kuat tapi hanya benar-benar agresif saat menuju store.

Kalau semua panel kamu bikin agresif, user capek. Blueprint ini sengaja menyeimbangkan.

---

# Micro-interaction untuk Planet Hub (ikon planet 2 cincin)

Idle:

* Planet berputar pelan, cincin punya shimmer halus
  Hover:
* Planet sedikit mendekat, cincin glow naik
  Pressed:
* Cincin “snap” lebih cepat 1x
  Selected/Preview 0.28s:
* Planet bergerak ke tengah (awal PlanetHubMode) lalu panel lain mulai reorganisasi orbit

Planet hub harus terasa berbeda dari panel, karena dia adalah mode switch, bukan halaman.

---

# Micro-interaction untuk Search bar & Keyboard hologram (nyambung ke pitch)

Search bar:

* Saat pitch turun melewati ambang: search bar turun sedikit + glow naik + caret hint muncul
  Keyboard:
* Reveal berdasarkan pitch, bukan klik
* Tombol keyboard (kalau divisualkan) hanya animasi, bukan wajib diklik
* Saat user fokus input: keyboard scanline jalan pelan, bukan blink cepat

---

Mantap. Ini **token set** yang jadi “single control surface” buat semua rasa yang kita blueprint: micro-interaction panel 3D, portal/Link Start, background 2D (starfield + black hole sliver), sampai aturan orbit dan safe-cone black hole. Kamu tinggal tuning di satu tempat, dan seluruh web ikut berubah konsisten.

Aku bikin dalam dua bentuk yang saling nyambung: **`tokens.ts`** (runtime tokens untuk Three/R3F + portal logic) dan **`tokens.css`** (CSS variables untuk halaman 2D). Kamu bisa pakai salah satu dulu, tapi paling enak keduanya dipakai bareng supaya 3D dan 2D benar-benar satu DNA.

```ts
// src/theme/tokens.ts
// Ophius Galaxy + Pages Tokens
// Unit conventions:
// - time: seconds (s)
// - 3D distance: world units (wu)
// - angles: degrees (deg)
// - colors: HSL strings for easy tuning
// - strengths: 0..1 unless specified

export const TOKENS = {
  time: {
    hoverIn: 0.16,
    hoverOut: 0.26,
    pressedIn: 0.08,
    pressedOut: 0.14,

    focusPreview: 0.28, // signature: always before portal-out
    miniPreview2D: 0.26, // before portal reverse to galaxy

    portalOutMin: 0.55,
    portalOutMax: 0.92,
    portalFadeMin: 0.22,
    portalFadeMax: 0.35,

    inRealmZoomIn: 0.85, // e.g. opening big panel (not leaving realm)
    inRealmZoomOut: 0.65,
    planetHubIn: 0.95,
    planetHubOut: 0.75,

    keyboardReveal: 0.30,
  },

  motion: {
    panel: {
      hoverLift: 0.55, // wu, along -Z camera direction (apparent lift)
      hoverRaiseY: 0.08, // wu
      hoverScale: 1.045,
      pressedScale: 0.985,

      tiltMaxDeg: 6.5, // desktop pointer-based tilt
      tiltReturnS: 0.22,

      orbitBobAmpY: 0.25, // wu
      orbitBobSpeed: 0.55, // Hz-ish feel, used as multiplier in sin(t)
      orbitDriftDegPerS: 1.2, // panel ring slow drift

      faceCameraOnHover: 0.55, // 0..1 (0 = none, 1 = full billboard)
      faceCameraOnPreview: 0.85,
    },

    camera: {
      fovDeg: 50,
      near: 0.1,
      far: 350,

      pitchMinDeg: -24,
      pitchMaxDeg: 12,

      inertiaS: 0.18, // camera rig smoothing
      yawSpeed: 1.0, // sensitivity multiplier
      pitchSpeed: 0.85,

      focusYawLimitDeg: 10, // when FocusPanelMode is active
    },
  },

  holo: {
    glass: {
      opacityIdle: 0.72,
      opacityHover: 0.84,
      opacityMuted: 0.52, // other panels when one is selected/preview
      blurPx2D: 14, // for CSS backdrop-filter on 2D surfaces
    },

    edge: {
      widthPx2D: 1.0,
      glowStrengthIdle: 0.18,
      glowStrengthHover: 0.42,
      glowStrengthSelected: 0.58,
      cornerMarkersOpacity: 0.22, // docs-style brackets
    },

    scanline: {
      opacity: 0.06,
      speed: 0.35,
    },

    noise: {
      opacity: 0.035,
      scale: 1.0,
    },
  },

  galaxy: {
    rings: {
      panelRadiusBase: 10.2,
      panelRadiusVar: 1.2,
      panelHeightBase: 0.20,

      debrisRadiusMin: 18,
      debrisRadiusMax: 26,

      zodiacRadius: 130,
      zodiacTiltDeg: 18,
    },

    featured: {
      // "Game" featured anchor near front-left
      azimuthDeg: -15,
      radius: 9.6,
      scale: 1.15,
    },

    planetHub: {
      azimuthDeg: 40,
      radius: 9.4,
      scale: 1.15,
    },

    blackHole: {
      // anchor "left-front", visible as sliver on landing, clear when yaw left
      position: { x: -18, y: 0.10, z: 18 },
      diskRadius: 7.5,
      horizonRadius: 2.2,

      // safe cone: panels inside this cone get gently pushed away during BH reveal
      safeConeCenterAzimuthDeg: -65,
      safeConeHalfAngleDeg: 30, // cone approx [-95, -35]
      safePushRadius: 1.35,
      safePushY: 0.32,
      safeDimOpacity: 0.68,

      revealYawCenterDeg: -50, // when camera yaw approaches this, BH boosts slightly
      revealYawHalfWidthDeg: 22,
      revealBloomBoost: 0.18,
      revealSwirlSpeedBoost: 0.12,
    },

    zodiac: {
      highlightAzimuthMinDeg: 20,
      highlightAzimuthMaxDeg: 160,
      dimNearBlackHole: 0.55, // opacity multiplier for zodiac near BH direction
      baseOpacity: 0.22,
      twinkleStrength: 0.08,
      twinkleSpeed: 0.10,
      glyphSize: 2.0,
    },

    search: {
      pitchRevealStartDeg: -12,
      pitchRevealFullDeg: -16,
      barPullDownWu: 0.28,
      keyboardGlowBoost: 0.35,
    },
  },

  page2D: {
    background: {
      blackHoleSliverWidthPct: 0.16, // 16% viewport width
      blackHoleSliverFadePct: 0.42, // fade length into content area
      starDensity: 0.65, // conceptual intensity (0..1)
      starOpacity: 0.18,
      starBlurPx: 1.2,
    },

    surface: {
      maxWidthPx: 1120,
      paddingPx: 28,
      radiusPx: 20,
      borderOpacity: 0.24,
      borderGlow: 0.18,
      contentBgOpacity: 0.62,
    },

    header: {
      heightPx: 64,
      blurPx: 14,
      borderOpacity: 0.22,
      stickySolidBoost: 0.10, // becomes more solid on scroll
    },

    typography: {
      // body is intentionally neutral for long reading
      bodySizePx: 16,
      bodyLineHeight: 1.75,
      bodyOpacity: 0.92,

      // display/heading carries holo feel
      headingTrackingEm: 0.02,
      headingGlow: 0.08,
      codeSizePx: 14,
    },
  },

  portal: {
    swapT: 0.66, // normalized 0..1 progress where route swap usually happens
    swapFlexS: 0.16, // how long portal can "hold" if target not minimal-ready
    flashStrength: 0.85,
    chromaStrength: 0.22,
    grainStrength: 0.10,

    streak: {
      densityBase: 0.55,
      speedBase: 1.0,
      lengthBase: 0.62,
    },

    reduceMotion: {
      enabledByPrefersReducedMotion: true,
      blurZoomFallbackStrength: 0.55,
    },
  },

  profiles: {
    // Accent colors are used for edge glow, tiny indicators, and portal tint.
    // Keep body text neutral; do not tint everything.
    docs: {
      accent: "hsl(190 100% 65%)",
      portal: { streakDensity: 0.55, streakSpeed: 0.95, chaos: 0.18, hud: 0.22 },
      panel: { shimmer: 0.10, cornerMarkers: 0.55 },
    },
    projects: {
      accent: "hsl(250 95% 70%)",
      portal: { streakDensity: 0.60, streakSpeed: 1.00, chaos: 0.28, hud: 0.18 },
      panel: { shimmer: 0.14, ghostCards: 0.55 },
    },
    team: {
      accent: "hsl(320 80% 72%)",
      portal: { streakDensity: 0.48, streakSpeed: 0.92, chaos: 0.16, hud: 0.14 },
      panel: { shimmer: 0.08, pulse: 0.55 },
    },
    gallery: {
      accent: "hsl(48 90% 70%)",
      portal: { streakDensity: 0.58, streakSpeed: 0.98, chaos: 0.22, hud: 0.16 },
      panel: { shimmer: 0.22, aperture: 0.65, sparkle: 0.22 },
    },
    media: {
      accent: "hsl(210 90% 72%)",
      portal: { streakDensity: 0.62, streakSpeed: 1.02, chaos: 0.24, hud: 0.20 },
      panel: { shimmer: 0.18, filmstrip: 0.60 },
    },
    news: {
      accent: "hsl(32 100% 68%)",
      portal: { streakDensity: 0.70, streakSpeed: 1.12, chaos: 0.36, hud: 0.26 },
      panel: { shimmer: 0.10, ticker: 0.70 },
    },
    contact: {
      accent: "hsl(145 95% 62%)",
      portal: { streakDensity: 0.66, streakSpeed: 1.05, chaos: 0.28, hud: 0.24 },
      panel: { shimmer: 0.12, signal: 0.72 },
    },
    store: {
      accent: "hsl(145 100% 62%)",
      portal: { streakDensity: 0.86, streakSpeed: 1.25, chaos: 0.46, hud: 0.40 },
      panel: { shimmer: 0.30, gate: 0.80 },
    },
    utility: {
      accent: "hsl(200 85% 68%)",
      portal: { streakDensity: 0.52, streakSpeed: 0.95, chaos: 0.18, hud: 0.14 },
      panel: { shimmer: 0.10 },
    },
  },

  // Panel-specific overrides on top of profile values
  panels: {
    game: {
      profile: "media" as const, // in-realm focus panel look feels cinematic
      heroLiftBoost: 0.18, // adds to hoverLift
      videoBrightnessHover: 0.08,
      storeProfile: "store" as const,
    },
    projects: { profile: "projects" as const },
    team: { profile: "team" as const },
    docs: { profile: "docs" as const },
    gallery: { profile: "gallery" as const },
    media: { profile: "media" as const },
    news: { profile: "news" as const },
    contact: { profile: "contact" as const },
  },
} as const;

export type ProfileName = keyof typeof TOKENS.profiles;

// Route → profile mapping (single source of truth)
export function profileForPath(pathname: string): ProfileName {
  if (pathname === "/" || pathname === "/galaxy") return "utility";
  if (pathname.startsWith("/docs")) return "docs";
  if (pathname.startsWith("/projects")) return "projects";
  if (pathname.startsWith("/team")) return "team";
  if (pathname.startsWith("/gallery")) return "gallery";
  if (pathname.startsWith("/media")) return "media";
  if (pathname.startsWith("/news")) return "news";
  if (pathname.startsWith("/contact")) return "contact";
  if (pathname.startsWith("/games")) return "media";
  if (
    pathname === "/about" ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/careers") ||
    pathname.startsWith("/roadmap") ||
    pathname.startsWith("/status") ||
    pathname.startsWith("/support")
  ) return "utility";
  return "utility";
}

// External URL → profile mapping (store is special)
export function profileForExternalUrl(url: string): ProfileName {
  const u = url.toLowerCase();
  if (u.includes("store.steampowered.com")) return "store";
  if (u.includes("itch.io")) return "store";
  if (u.includes("play.google.com")) return "store";
  if (u.includes("apps.apple.com")) return "store";
  if (u.includes("youtube.com") || u.includes("vimeo.com")) return "media";
  if (u.includes("github.com")) return "docs";
  return "utility";
}

// Tiny helpers often used in animation code
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
```

```css
/* src/styles/tokens.css */
/* Keep these aligned with TOKENS.page2D + TOKENS.profiles accents */

:root {
  --oph-void-0: 8 10 16;         /* base void RGB */
  --oph-void-1: 5 7 12;          /* deeper void */
  --oph-star-opacity: 0.18;
  --oph-star-blur: 1.2px;

  --oph-bh-sliver-w: 16vw;
  --oph-bh-sliver-fade: 42vw;

  --oph-surface-bg: rgba(10, 12, 18, 0.62);
  --oph-surface-radius: 20px;
  --oph-surface-padding: 28px;
  --oph-surface-maxw: 1120px;

  --oph-header-h: 64px;
  --oph-header-blur: 14px;

  --oph-text: rgba(235, 242, 255, 0.92);
  --oph-text-muted: rgba(235, 242, 255, 0.72);

  --oph-accent-docs: hsl(190 100% 65%);
  --oph-accent-projects: hsl(250 95% 70%);
  --oph-accent-team: hsl(320 80% 72%);
  --oph-accent-gallery: hsl(48 90% 70%);
  --oph-accent-media: hsl(210 90% 72%);
  --oph-accent-news: hsl(32 100% 68%);
  --oph-accent-contact: hsl(145 95% 62%);
  --oph-accent-store: hsl(145 100% 62%);
  --oph-accent-utility: hsl(200 85% 68%);

  --oph-holo-noise: 0.035;
  --oph-holo-scanline: 0.06;
}

/* Example background pattern contract for all 2D pages */
.oph-page-bg {
  background:
    radial-gradient(1200px 600px at 18% 45%, rgba(255,255,255,0.05), transparent 55%),
    radial-gradient(900px 500px at 0% 55%, rgba(255,255,255,0.04), transparent 60%),
    linear-gradient(180deg, rgb(var(--oph-void-0)), rgb(var(--oph-void-1)));
  color: var(--oph-text);
}

/* Black hole sliver placeholder area (you can replace with an image or shader canvas) */
.oph-bh-sliver {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--oph-bh-sliver-w);
  pointer-events: none;
  filter: blur(0.2px);
  opacity: 0.9;
  mask-image: linear-gradient(90deg, #000 0%, #000 55%, transparent 100%);
}

/* Content surface contract */
.oph-surface {
  max-width: var(--oph-surface-maxw);
  margin: 0 auto;
  padding: var(--oph-surface-padding);
  border-radius: var(--oph-surface-radius);
  background: var(--oph-surface-bg);
  backdrop-filter: blur(var(--oph-header-blur));
  border: 1px solid rgba(255,255,255,0.12);
}

/* Header contract */
.oph-header {
  position: sticky;
  top: 0;
  height: var(--oph-header-h);
  backdrop-filter: blur(var(--oph-header-blur));
  background: rgba(10, 12, 18, 0.36);
  border-bottom: 1px solid rgba(255,255,255,0.10);
}
```

Dengan token ini, kamu bisa mengatur “rasa” seluruh sistem hanya dengan mengubah beberapa angka: `focusPreview` (signature 0.28), `portal.swapT`, aksen per profile, dan intensitas hologram (`edge.glowStrength*`, `scanline.opacity`, `noise.opacity`). Panel micro-interaction pun tinggal baca `TOKENS.panels[panelId].profile` lalu ambil aksen dan parameter profile-nya.

---

Mantap. Aku “kunci kontrak pemakaian token” dalam 3 titik yang kamu minta (panel interaction, portal timeline, dan theme 2D per route) dalam bentuk util kecil yang bisa kamu pakai berulang tanpa angka hardcode nyebar ke mana-mana. Aku tulis versi TypeScript yang netral (R3F + React Router gampang masuk), dan semuanya membaca dari `TOKENS` yang sudah kita set sebelumnya.

Di bawah ini ada empat file inti dan dua helper yang bikin semuanya nyambung: panel animator (3D), portal controller (global overlay), route theme applier (2D), plus helper untuk menentukan portal origin dari panel 3D (screen rect).

---

## Util 1: Panel interaction contract (hover/pressed/preview) berbasis token

File ini memastikan semua panel punya bahasa interaksi yang sama: Idle → Hover → Pressed → Preview (0.28s) tanpa hardcode durasi/lift/glow, semuanya dari `TOKENS`.

```ts
// src/galaxy/interactions/panelMotion.ts
import * as THREE from "three";
import { TOKENS, ProfileName } from "@/theme/tokens";

export type PanelState = "idle" | "hover" | "pressed" | "preview";

export type PanelProfileSpec = {
  profile: ProfileName;
  accent: string;
  // optional per-panel overrides
  heroLiftBoost?: number;
};

export type PanelMotionInput = {
  state: PanelState;
  // base orbit transform (computed elsewhere)
  basePosition: THREE.Vector3;
  baseQuaternion: THREE.Quaternion;
  baseScale: number;

  // camera for facing/tilt decisions
  camera: THREE.Camera;

  // pointer in normalized device coords (-1..1). Optional on mobile.
  pointerNdc?: { x: number; y: number };
};

export type PanelMotionTarget = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
  edgeGlow: number; // 0..1 to drive material
  innerGlow: number; // 0..1 to drive texture/shader highlight
};

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _m = new THREE.Matrix4();

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t: number) {
  t = clamp01(t);
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number) {
  t = clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function getPanelProfileSpec(panelId: keyof typeof TOKENS.panels): PanelProfileSpec {
  const p = TOKENS.panels[panelId];
  const profile = p.profile;
  const accent = TOKENS.profiles[profile].accent;
  return { profile, accent, heroLiftBoost: (p as any).heroLiftBoost };
}

/**
 * Contract:
 * - No numbers hardcoded outside TOKENS.
 * - All states map to lift/scale/glow consistently.
 * - Facing camera increases on hover/preview based on TOKENS.motion.panel.faceCameraOn*.
 */
export function computePanelTarget(
  panelSpec: PanelProfileSpec,
  input: PanelMotionInput
): PanelMotionTarget {
  const t = TOKENS;
  const basePos = input.basePosition;
  const baseQuat = input.baseQuaternion;

  // Default outputs
  const outPos = basePos.clone();
  const outQuat = baseQuat.clone();
  let outScale = input.baseScale;

  const isHover = input.state === "hover";
  const isPressed = input.state === "pressed";
  const isPreview = input.state === "preview";

  const hoverLift = t.motion.panel.hoverLift + (panelSpec.heroLiftBoost ?? 0);
  const hoverScale = t.motion.panel.hoverScale;
  const pressedScale = t.motion.panel.pressedScale;

  // Determine intensity factor per state
  const k = isPreview ? 1.0 : isPressed ? 0.85 : isHover ? 0.65 : 0.0;
  const kEase = isPreview ? easeInOutCubic(k) : easeOutCubic(k);

  // Lift “toward camera” + slight raise in Y
  const camDir = _v.set(0, 0, -1).applyQuaternion(input.camera.quaternion).normalize(); // camera forward
  outPos.addScaledVector(camDir, -hoverLift * kEase); // move toward camera
  outPos.y += t.motion.panel.hoverRaiseY * kEase;

  // Scale behavior
  if (isHover) outScale *= hoverScale;
  if (isPressed) outScale *= pressedScale;
  if (isPreview) outScale *= (hoverScale + 0.06); // small extra emphasis

  // Facing camera factor
  const faceK = isPreview ? t.motion.panel.faceCameraOnPreview : isHover ? t.motion.panel.faceCameraOnHover : 0.0;

  if (faceK > 0) {
    // Blend base orientation with “lookAt camera” orientation (billboard-ish but still 3D)
    _m.lookAt(outPos, input.camera.position, new THREE.Vector3(0, 1, 0));
    _q.setFromRotationMatrix(_m);
    outQuat.slerp(_q, faceK);
  }

  // Pointer tilt (desktop)
  const tiltMax = THREE.MathUtils.degToRad(t.motion.panel.tiltMaxDeg);
  if (input.pointerNdc && (isHover || isPressed)) {
    const tx = -input.pointerNdc.y * tiltMax * 0.55;
    const ty = input.pointerNdc.x * tiltMax;
    _e.set(tx, ty, 0, "XYZ");
    _q.setFromEuler(_e);
    outQuat.multiply(_q);
  }

  // Glow levels from tokens + profile “shimmer” influence
  const profile = TOKENS.profiles[panelSpec.profile];
  const shimmer = (profile.panel as any)?.shimmer ?? 0.1;

  const edgeGlow =
    t.holo.edge.glowStrengthIdle +
    (isHover ? t.holo.edge.glowStrengthHover : 0) +
    (isPreview ? t.holo.edge.glowStrengthSelected : 0);

  const innerGlow = clamp01((isHover ? 0.25 : 0) + (isPreview ? 0.45 : 0) + shimmer * 0.25);

  return {
    position: outPos,
    quaternion: outQuat,
    scale: outScale,
    edgeGlow: clamp01(edgeGlow),
    innerGlow,
  };
}
```

Kalau nanti kamu pakai R3F, kontraknya tinggal: setiap frame kamu compute base orbit transform, lalu panggil `computePanelTarget`, lalu lerp mesh ke target. Dengan ini, semua panel selalu “berasa satu bahasa” dan tinggal beda aksen/profile.

---

## Util 2: Portal controller contract (preview 0.28s, swap saat ready, profile otomatis)

Ini mesin portal yang mengunci ritme: FocusPreview 0.28 detik, lalu portal out sesuai profile destination, swap route hanya ketika target “minimal ready”, lalu portal fade. Dia juga mengunci reverse untuk Back to Galaxy.

```ts
// src/portal/portalController.ts
import { TOKENS, ProfileName, profileForPath, profileForExternalUrl } from "@/theme/tokens";

export type PortalPhase =
  | "idle"
  | "focusPreview"
  | "portalOut"
  | "holdForReady"
  | "portalFade"
  | "portalIn";

export type PortalTarget =
  | { kind: "internal"; toPath: string; profile: ProfileName }
  | { kind: "external"; url: string; profile: ProfileName; openNewTab: boolean };

export type PortalOriginRect = {
  x: number; // px
  y: number; // px
  w: number; // px
  h: number; // px
};

export type PortalState = {
  phase: PortalPhase;
  t: number; // normalized progress within current phase 0..1
  profile: ProfileName;
  origin?: PortalOriginRect;
  target?: PortalTarget;
  shouldSwap: boolean; // becomes true at swap moment
};

type StartInternalArgs = { toPath: string; origin?: PortalOriginRect };
type StartExternalArgs = { url: string; origin?: PortalOriginRect; openNewTab?: boolean };

export class PortalController {
  state: PortalState = { phase: "idle", t: 0, profile: "utility", shouldSwap: false };

  private _phaseStart = 0;
  private _phaseDur = 1;
  private _now = () => performance.now() / 1000;

  private _destinationReady = false;
  private _swapFired = false;

  reset() {
    this.state = { phase: "idle", t: 0, profile: "utility", shouldSwap: false };
    this._destinationReady = false;
    this._swapFired = false;
  }

  markDestinationReady() {
    this._destinationReady = true;
  }

  startInternal({ toPath, origin }: StartInternalArgs) {
    const profile = profileForPath(toPath);
    const target: PortalTarget = { kind: "internal", toPath, profile };
    this._start(target, origin);
  }

  startExternal({ url, origin, openNewTab }: StartExternalArgs) {
    const profile = profileForExternalUrl(url);
    const target: PortalTarget = {
      kind: "external",
      url,
      profile,
      openNewTab: openNewTab ?? true, // premium default
    };
    this._start(target, origin);
  }

  private _start(target: PortalTarget, origin?: PortalOriginRect) {
    if (this.state.phase !== "idle") return;

    this._destinationReady = false;
    this._swapFired = false;

    this.state = {
      phase: "focusPreview",
      t: 0,
      profile: target.profile,
      origin,
      target,
      shouldSwap: false,
    };

    this._phaseStart = this._now();
    this._phaseDur = TOKENS.time.focusPreview;
  }

  /**
   * Contract:
   * - Call tick(dt) from RAF/useFrame.
   * - When state.shouldSwap becomes true, do your navigate/open link immediately.
   * - For internal routes, call markDestinationReady() from the destination page when mounted
   *   (so portal can finish without blank).
   */
  tick() {
    if (this.state.phase === "idle") return;

    const now = this._now();
    const elapsed = now - this._phaseStart;
    const t = Math.max(0, Math.min(1, elapsed / this._phaseDur));
    this.state.t = t;
    this.state.shouldSwap = false;

    if (t < 1) return;

    // Phase transition
    if (this.state.phase === "focusPreview") {
      this.state.phase = "portalOut";
      this._phaseStart = now;
      // portal duration depends on profile, bounded by token min/max
      const p = TOKENS.profiles[this.state.profile].portal;
      const k = Math.max(0, Math.min(1, (p.streakSpeed - 0.9) / (1.25 - 0.9))); // heuristic
      this._phaseDur = TOKENS.time.portalOutMin + (TOKENS.time.portalOutMax - TOKENS.time.portalOutMin) * k;
      this.state.t = 0;
      return;
    }

    if (this.state.phase === "portalOut") {
      // Determine swap moment
      if (!this._swapFired) {
        this._swapFired = true;
        this.state.shouldSwap = true;
      }

      // If internal, wait until destination ready (within flex window)
      if (this.state.target?.kind === "internal") {
        if (this._destinationReady) {
          this.state.phase = "portalFade";
          this._phaseStart = now;
          this._phaseDur = TOKENS.time.portalFadeMin;
          this.state.t = 0;
          return;
        }

        // Hold briefly if not ready
        this.state.phase = "holdForReady";
        this._phaseStart = now;
        this._phaseDur = TOKENS.portal.swapFlexS;
        this.state.t = 0;
        return;
      }

      // External: just fade out (portal can end regardless)
      this.state.phase = "portalFade";
      this._phaseStart = now;
      this._phaseDur = TOKENS.time.portalFadeMin;
      this.state.t = 0;
      return;
    }

    if (this.state.phase === "holdForReady") {
      if (this._destinationReady) {
        this.state.phase = "portalFade";
        this._phaseStart = now;
        this._phaseDur = TOKENS.time.portalFadeMin;
        this.state.t = 0;
        return;
      }
      // Even if not ready after flex, proceed to fade (better than hanging)
      this.state.phase = "portalFade";
      this._phaseStart = now;
      this._phaseDur = TOKENS.time.portalFadeMax;
      this.state.t = 0;
      return;
    }

    if (this.state.phase === "portalFade") {
      this.reset();
      return;
    }
  }
}
```

Kontrak pakainya simpel: `PortalController` itu “otak”, sementara `PortalOverlay` adalah “mata”-nya. UI overlay kamu tinggal baca `controller.state` dan render shader/CSS sesuai `phase`, `t`, `profile`, dan `origin`.

---

## Util 3: Theme 2D contract (accent + data attribute otomatis per route)

Ini membuat halaman 2D otomatis punya aksen warna sesuai section (Docs cyan, News amber, Contact green, dll) tanpa hardcode di tiap page. Kamu bisa memakainya buat style tombol, link hover, border glow, dan breadcrumb highlight.

```ts
// src/pages/theme/useRouteTheme.ts
import { useEffect } from "react";
import { TOKENS, profileForPath, ProfileName } from "@/theme/tokens";

function cssVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

export function applyProfileTheme(profile: ProfileName) {
  const accent = TOKENS.profiles[profile].accent;
  document.documentElement.setAttribute("data-oph-profile", profile);
  cssVar("--oph-accent", accent);
}

export function useRouteTheme(pathname: string) {
  useEffect(() => {
    const profile = profileForPath(pathname);
    applyProfileTheme(profile);
  }, [pathname]);
}
```

Di CSS, kamu tinggal pakai `--oph-accent` untuk highlight yang “profil-aware”, misalnya breadcrumb item aktif atau underline link.

---

## Helper penting: origin portal dari panel 3D (screen rect)

Agar portal selalu “lahir dari panel yang diklik” (bukan dari tengah layar), kamu perlu convert plane panel 3D jadi screen-rect. Ini version yang cukup akurat untuk panel berbentuk plane.

```ts
// src/portal/screenRectFromPanel.ts
import * as THREE from "three";

export function getScreenRectFromPlaneMesh(
  mesh: THREE.Mesh,
  camera: THREE.Camera,
  viewport: { width: number; height: number }
) {
  // Assumes the mesh is a plane-like object centered at origin in its local space
  mesh.updateWorldMatrix(true, false);

  const geom = mesh.geometry as THREE.BufferGeometry;
  geom.computeBoundingBox();
  const bb = geom.boundingBox;
  if (!bb) return null;

  const corners = [
    new THREE.Vector3(bb.min.x, bb.min.y, 0),
    new THREE.Vector3(bb.max.x, bb.min.y, 0),
    new THREE.Vector3(bb.min.x, bb.max.y, 0),
    new THREE.Vector3(bb.max.x, bb.max.y, 0),
  ];

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const c of corners) {
    c.applyMatrix4(mesh.matrixWorld);
    c.project(camera);

    const sx = (c.x * 0.5 + 0.5) * viewport.width;
    const sy = (-c.y * 0.5 + 0.5) * viewport.height;

    minX = Math.min(minX, sx);
    minY = Math.min(minY, sy);
    maxX = Math.max(maxX, sx);
    maxY = Math.max(maxY, sy);
  }

  const x = minX;
  const y = minY;
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);

  return { x, y, w, h };
}
```

---

## Glue util: “navigateWithPortal” yang tidak pernah hardcode profile/durasi

Ini pengikat yang biasanya paling bikin rapi: klik panel cukup memanggil satu fungsi. Fungsi ini yang menentukan profile otomatis, memulai preview, memicu portal, lalu melakukan swap ketika `shouldSwap` true.

```ts
// src/portal/navigateWithPortal.ts
import { PortalController } from "@/portal/portalController";

export function createNavigator(portal: PortalController, opts: {
  navigateInternal: (toPath: string) => void; // e.g. react-router navigate()
  openExternal: (url: string, newTab: boolean) => void;
}) {
  return {
    toPath(toPath: string, origin?: { x: number; y: number; w: number; h: number }) {
      portal.startInternal({ toPath, origin });
    },
    toExternal(url: string, origin?: { x: number; y: number; w: number; h: number }, openNewTab?: boolean) {
      portal.startExternal({ url, origin, openNewTab });
    },

    /**
     * Call this once per frame (RAF/useFrame). It will fire navigate/open at the right time.
     */
    tick() {
      const before = portal.state.phase;
      portal.tick();

      if (portal.state.shouldSwap && portal.state.target) {
        const t = portal.state.target;
        if (t.kind === "internal") opts.navigateInternal(t.toPath);
        else opts.openExternal(t.url, t.openNewTab);
      }

      // useful if you want analytics on phase changes
      return { before, after: portal.state.phase };
    },
  };
}
```

---

## Cara “destination ready” yang paling bersih (tanpa pusing)

Agar portal tidak menampilkan blank pada halaman 2D, kontraknya begini: setiap page 2D memanggil `portal.markDestinationReady()` sekali ketika layout minimal sudah mount. Itu cukup untuk membuat portal fade selesai.

Contoh kecil (cukup sekali per page, biasanya di layout wrapper Pages):

```ts
// src/pages/PagesLayout.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRouteTheme } from "@/pages/theme/useRouteTheme";
import { portalSingleton } from "@/singletons/portalSingleton"; // misal kamu simpan controller global

export function PagesLayout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  useRouteTheme(loc.pathname);

  useEffect(() => {
    // minimal ready: header + surface sudah mount
    portalSingleton.markDestinationReady();
  }, [loc.pathname]);

  return (
    <div className="oph-page-bg">
      {children}
    </div>
  );
}
```

---

Oke. Ini skeleton `PortalOverlay` yang benar-benar “kelihatan” (SAO-style warp) dan sepenuhnya dikendalikan oleh `PortalController.state` + `TOKENS.profiles[profile].portal`. Implementasinya pakai **fullscreen `<canvas>` 2D** (paling cepat jadi, tidak perlu setup WebGL/shader dulu), tapi struktur dan parameternya sudah aku desain supaya nanti kalau kamu mau ganti ke fragment shader pun kontraknya tetap sama.

Komponen ini hidup sekali di App Shell (di atas GalaxyCanvas dan PageSurface), membaca `portal.state` setiap frame, dan merender ring + streaks + flash + grain berdasarkan `phase`, `t`, `profile`, dan `origin rect` (panel yang diklik). Saat `shouldSwap` menyala 1 frame, overlay memicu “flash beat” untuk rasa teleport.

```tsx
// src/portal/PortalOverlay.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { TOKENS, ProfileName, lerp, clamp01 } from "@/theme/tokens";
import type { PortalController, PortalOriginRect } from "@/portal/portalController";

type Props = {
  portal: PortalController;
  className?: string;
};

type Streak = {
  a: number;     // angle (rad)
  w: number;     // width
  len: number;   // base length
  spd: number;   // speed factor
  off: number;   // phase offset
};

function easeOutCubic(t: number) {
  t = clamp01(t);
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutCubic(t: number) {
  t = clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function parseHslAccent(hsl: string) {
  // expects "hsl(H S% L%)" (from TOKENS)
  const m = hsl.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/i);
  if (!m) return { h: 200, s: 80, l: 65 };
  return { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) };
}

function hslToRgba(h: number, s: number, l: number, a: number) {
  // minimal HSL->RGB for canvas strokes
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (0 <= hp && hp < 1) [r, g, b] = [c, x, 0];
  else if (1 <= hp && hp < 2) [r, g, b] = [x, c, 0];
  else if (2 <= hp && hp < 3) [r, g, b] = [0, c, x];
  else if (3 <= hp && hp < 4) [r, g, b] = [0, x, c];
  else if (4 <= hp && hp < 5) [r, g, b] = [x, 0, c];
  else if (5 <= hp && hp < 6) [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return `rgba(${r},${g},${b},${a})`;
}

function originToCenter(origin: PortalOriginRect | undefined, w: number, h: number) {
  if (!origin) return { cx: w * 0.5, cy: h * 0.5, r0: Math.min(w, h) * 0.08 };
  const cx = origin.x + origin.w * 0.5;
  const cy = origin.y + origin.h * 0.5;
  const r0 = Math.max(origin.w, origin.h) * 0.55;
  return { cx, cy, r0 };
}

function prefersReducedMotion() {
  if (!TOKENS.portal.reduceMotion.enabledByPrefersReducedMotion) return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export default function PortalOverlay({ portal, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const streaksRef = useRef<Streak[]>([]);
  const seedRef = useRef<number>(Math.random() * 9999);
  const lastPhaseRef = useRef<string>("idle");

  const flashRef = useRef<{ t0: number; strength: number } | null>(null);

  const noiseCanvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }, []);

  function rebuildStreaks(profile: ProfileName) {
    const p = TOKENS.profiles[profile].portal;
    const base = TOKENS.portal.streak.densityBase;
    const density = clamp01(base * p.streakDensity);
    const count = Math.floor(220 + density * 520); // feels SAO-ish without being insane

    const chaos = clamp01(p.chaos);
    const rand = mulberry32(seedRef.current);

    const streaks: Streak[] = [];
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const w = lerp(0.35, 2.4, Math.pow(rand(), 2)) * (0.8 + chaos * 0.7);
      const len = lerp(0.14, 1.0, Math.pow(rand(), 0.6));
      const spd = lerp(0.55, 1.6, Math.pow(rand(), 0.5)) * (0.85 + p.streakSpeed * 0.25);
      const off = rand() * Math.PI * 2;
      streaks.push({ a, w, len, spd, off });
    }
    streaksRef.current = streaks;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true })!;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (canvas.width !== Math.floor(vw * dpr) || canvas.height !== Math.floor(vh * dpr)) {
        canvas.width = Math.floor(vw * dpr);
        canvas.height = Math.floor(vh * dpr);
        canvas.style.width = `${vw}px`;
        canvas.style.height = `${vh}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const st = portal.state;
      const phase = st.phase;

      if (phase !== lastPhaseRef.current) {
        lastPhaseRef.current = phase;
        if (phase === "focusPreview" || phase === "portalOut" || phase === "portalIn") {
          seedRef.current = Math.random() * 9999;
          rebuildStreaks(st.profile);
        }
      }

      if (st.shouldSwap) {
        flashRef.current = { t0: now / 1000, strength: TOKENS.portal.flashStrength };
      }

      ctx.clearRect(0, 0, vw, vh);

      if (phase === "idle") {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const prof = st.profile;
      const profSpec = TOKENS.profiles[prof];
      const accent = parseHslAccent(profSpec.accent);

      const rm = prefersReducedMotion();

      const { cx: ocx, cy: ocy, r0 } = originToCenter(st.origin, vw, vh);
      const scx = vw * 0.5;
      const scy = vh * 0.5;

      const pFocus = phase === "focusPreview" ? st.t : 0;
      const pOut =
        phase === "portalOut" ? st.t :
        phase === "holdForReady" ? 1 :
        phase === "portalFade" ? 1 :
        0;

      const pFade = phase === "portalFade" ? st.t : 0;

      const focusK = easeOutCubic(pFocus);
      const outK = easeInOutCubic(pOut);
      const fadeK = easeOutCubic(pFade);

      const intensity =
        phase === "focusPreview" ? 0.18 + 0.30 * focusK :
        phase === "portalOut" ? 0.35 + 0.75 * outK :
        phase === "holdForReady" ? 1.0 :
        phase === "portalFade" ? 1.0 - fadeK :
        0.0;

      const expandK = clamp01(outK + focusK * 0.25);

      const centerPull = 0.35; // keep origin feel, but let it expand toward center
      const cx = lerp(ocx, scx, expandK * centerPull);
      const cy = lerp(ocy, scy, expandK * centerPull);

      const endR = Math.hypot(vw, vh) * 0.65;
      const r = lerp(r0, endR, expandK);

      drawGlowBase(ctx, cx, cy, r, accent, intensity);

      if (!rm) {
        drawRing(ctx, cx, cy, r, accent, intensity, expandK, profSpec.portal.hud);
        drawStreaks(ctx, cx, cy, r, now / 1000, intensity, prof, accent);
        drawHud(ctx, cx, cy, vw, vh, prof, accent, intensity, profSpec.portal.hud, phase, st.t);
        drawGrain(ctx, noiseCanvas, vw, vh, intensity * TOKENS.portal.grainStrength);
      } else {
        drawReducedMotion(ctx, cx, cy, r, accent, intensity);
      }

      drawFlash(ctx, vw, vh, now / 1000);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [portal, noiseCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "oph-portal-overlay"}
      aria-hidden="true"
    />
  );

  function drawFlash(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const f = flashRef.current;
    if (!f) return;
    const dt = t - f.t0;
    if (dt < 0) return;
    const dur = 0.14;
    const k = 1 - clamp01(dt / dur);
    if (k <= 0) {
      flashRef.current = null;
      return;
    }
    const a = k * k * f.strength * 0.55;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawGlowBase(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    accent: { h: number; s: number; l: number },
    intensity: number
  ) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2);
    const inner = hslToRgba(accent.h, accent.s, Math.min(92, accent.l + 18), 0.18 * intensity);
    const mid = hslToRgba(accent.h, accent.s, accent.l, 0.08 * intensity);
    g.addColorStop(0.0, inner);
    g.addColorStop(0.35, mid);
    g.addColorStop(1.0, "rgba(0,0,0,0)");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.restore();
  }

  function drawRing(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    accent: { h: number; s: number; l: number },
    intensity: number,
    expandK: number,
    hudK: number
  ) {
    const ringAlpha = 0.22 * intensity;
    const w = lerp(1.0, 3.2, expandK) * (0.85 + hudK * 0.4);

    const dx = TOKENS.portal.chromaStrength * 3.0;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = w;

    // chroma split (subtle)
    ctx.strokeStyle = hslToRgba(accent.h, accent.s, Math.min(95, accent.l + 20), ringAlpha * 0.55);
    ctx.beginPath();
    ctx.arc(cx - dx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = hslToRgba(accent.h, accent.s, accent.l, ringAlpha);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = hslToRgba(accent.h, accent.s, Math.min(95, accent.l + 10), ringAlpha * 0.45);
    ctx.beginPath();
    ctx.arc(cx + dx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawStreaks(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    timeS: number,
    intensity: number,
    profile: ProfileName,
    accent: { h: number; s: number; l: number }
  ) {
    const p = TOKENS.profiles[profile].portal;
    const chaos = clamp01(p.chaos);
    const spd = TOKENS.portal.streak.speedBase * p.streakSpeed;

    const baseLen = TOKENS.portal.streak.lengthBase;
    const lenMul = lerp(0.85, 1.45, chaos);

    const alphaBase = 0.08 * intensity;
    const hueJitter = lerp(3, 18, chaos);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const s of streaksRef.current) {
      const a = s.a + Math.sin(timeS * 0.6 + s.off) * 0.015 * chaos;
      const ca = Math.cos(a);
      const sa = Math.sin(a);

      const pulse = 0.5 + 0.5 * Math.sin(timeS * 3.2 * s.spd * spd + s.off);
      const localLen = r * (baseLen + s.len * lenMul) * (0.55 + pulse * 0.75);
      const start = r * (0.92 + 0.08 * pulse);

      const x0 = cx + ca * start;
      const y0 = cy + sa * start;
      const x1 = cx + ca * (start + localLen);
      const y1 = cy + sa * (start + localLen);

      const lw = s.w * (0.85 + pulse * 0.35);
      const hue = (accent.h + (pulse - 0.5) * hueJitter + 360) % 360;
      const col = hslToRgba(hue, accent.s, Math.min(92, accent.l + 18), alphaBase * (0.55 + pulse));

      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawHud(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    profile: ProfileName,
    accent: { h: number; s: number; l: number },
    intensity: number,
    hudK: number,
    phase: string,
    t: number
  ) {
    if (hudK <= 0.01) return;
    if (!(phase === "portalOut" || phase === "focusPreview")) return;

    const show = phase === "focusPreview" ? 1 : clamp01(1 - t / 0.38);
    const a = 0.24 * intensity * hudK * show;

    const label =
      profile === "docs" ? "SYNC BLUEPRINT" :
      profile === "projects" ? "ASSEMBLE" :
      profile === "news" ? "LIVE FEED" :
      profile === "contact" ? "OPEN CHANNEL" :
      profile === "store" ? "LINK START" :
      profile === "media" ? "PLAYBACK" :
      profile === "gallery" ? "SHUTTER" :
      profile === "team" ? "CONNECT" :
      "LINK";

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = hslToRgba(accent.h, accent.s, Math.min(95, accent.l + 20), a);
    ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // small brackets around the text
    const y = cy + Math.min(140, h * 0.18);
    ctx.fillText(label, cx, y);

    const bw = 120;
    const bh = 18;
    ctx.strokeStyle = hslToRgba(accent.h, accent.s, accent.l, a * 0.85);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2, y - bh);
    ctx.lineTo(cx - bw / 2 + 12, y - bh);
    ctx.moveTo(cx - bw / 2, y - bh);
    ctx.lineTo(cx - bw / 2, y - bh + 10);
    ctx.moveTo(cx + bw / 2, y - bh);
    ctx.lineTo(cx + bw / 2 - 12, y - bh);
    ctx.moveTo(cx + bw / 2, y - bh);
    ctx.lineTo(cx + bw / 2, y - bh + 10);
    ctx.stroke();

    ctx.restore();
  }

  function drawGrain(
    ctx: CanvasRenderingContext2D,
    noise: HTMLCanvasElement,
    w: number,
    h: number,
    a: number
  ) {
    if (a <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.globalCompositeOperation = "overlay";
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(noise, 0, 0, w, h);
    ctx.restore();
  }

  function drawReducedMotion(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    accent: { h: number; s: number; l: number },
    intensity: number
  ) {
    const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.2);
    g.addColorStop(0, hslToRgba(accent.h, accent.s, Math.min(95, accent.l + 15), 0.16 * intensity));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.restore();
  }
}

// deterministic RNG
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
```

CSS overlay-nya cukup begini supaya selalu menutup layar, tidak mengganggu klik saat idle, dan otomatis “aktif” saat phase bukan idle:

```css
/* src/portal/portalOverlay.css */
.oph-portal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  width: 100vw;
  height: 100vh;
  mix-blend-mode: normal;
}
```

Kalau kamu ingin overlay benar-benar “terasa menyatu” dengan galaxy (lebih glow), kamu bisa ubah `mix-blend-mode` jadi `screen`, tapi ini kadang bikin UI 2D terlalu terang. Versi di atas aman dulu.

Agar portal “lahir dari panel yang diklik”, kamu cukup mengirim `origin rect` dari hasil `getScreenRectFromPlaneMesh(...)` yang sudah kita buat sebelumnya ke `portal.startInternal()` atau `portal.startExternal()`. Kalau origin tidak ada, overlay otomatis pakai center layar.

Kalau kamu mau, aku bisa sekalian bikin versi `PortalOverlay` yang menggunakan **fragment shader** (lebih mirip Active Theory / SAO streak tunnel yang super halus) lewat WebGL tiny renderer, tapi skeleton canvas ini sudah cukup untuk mulai “kerasa” dan semua knob-nya sudah terikat ke `TOKENS.profiles[profile].portal` (density/speed/chaos/hud) jadi tinggal tuning rasa.

---

Implementasinya enaknya dibangun sebagai “satu mesin” yang punya 3 lapisan permanen: semesta 3D (Galaxy), permukaan halaman 2D (Pages), dan PortalOverlay (Link Start) yang selalu hidup di atas keduanya. Kalau kamu mengikuti pola ini, kamu nggak akan ketemu masalah klasik “transisi kepotong”, “layar blank”, atau “klik nggak bisa karena ada layer nindih”.

## Fondasi proyek yang langsung bikin semuanya nyambung

Kamu bikin App Shell yang tidak pernah mati. Di dalamnya ada Router (untuk route 2D), ada GalaxyCanvas (R3F/Three scene), ada PageSurface (Outlet route 2D), dan ada PortalOverlay. PortalOverlay harus berada di level paling atas dengan `pointer-events: none`, jadi tidak pernah menghalangi klik, dan hanya “muncul” secara visual saat `portal.state.phase !== "idle"`.

Yang kamu kunci sejak awal adalah `TOKENS` sebagai sumber kebenaran untuk semua durasi, intensitas glow, portal profile, dan mapping route→profile. Begitu `TOKENS` masuk, kamu wajib stop hardcode angka di komponen lain. Semua animasi dan style narik dari token.

## Navigasi sinematik: preview 0.28 detik + portal yang swap-nya aman

Kamu jadikan `PortalController` sebagai otak transisi global. App Shell harus punya 1 instance controller (singleton atau context) yang ditick setiap frame (RAF). Saat user klik panel, kamu tidak langsung `navigate()`. Kamu panggil `portal.startInternal({toPath, origin})`. PortalController otomatis menjalankan fase `focusPreview` 0.28 detik, lanjut `portalOut`, dan hanya memicu “swap” ketika `shouldSwap` true.

Di titik ini, kamu sambungkan `createNavigator()` (util yang kita bikin) supaya ketika `shouldSwap` true:

* untuk internal route: `navigateInternal(toPath)`
* untuk external store: `openExternal(url, openNewTab)`.

Hal penting: untuk internal route, halaman tujuan harus memberi sinyal “minimal ready” lewat `portal.markDestinationReady()` begitu layout header + surface sudah mount. Dengan itu portal fade-out tidak pernah membuka ke halaman kosong.

## PortalOverlay: bikin “kelihatan” dulu, baru nanti upgrade shader kalau mau

Kamu pasang `PortalOverlay` (canvas fullscreen) di App Shell, membaca `portal.state`. Portal overlay ini sudah dirancang agar:

* punya origin (rect panel) supaya portal “lahir dari panel yang diklik”
* punya profile tint + density/speed/chaos/hud dari `TOKENS.profiles[profile].portal`
* punya flash beat saat `shouldSwap` untuk rasa teleport.

Ini membuat transisi sudah terasa “SAO / Link Start” walaupun belum shader GLSL. Kalau nanti kamu mau upgrade ke shader WebGL, kontraknya tetap sama: inputnya tetap `phase`, `t`, `origin`, `profile`.

## Galaxy 3D: panel ring dulu, bukan black hole dulu

Supaya cepat “bisa dipakai”, kamu bangun Galaxy scene minimal yang sudah interaktif: ring panel 360°, raycast klik aman, hover feedback, dan FocusPreview 0.28 detik. Black hole dan zodiac bisa masuk setelah interaksi dasar stabil.

Di Galaxy, kamu perlu dua hal utama supaya tidak kejadian “nggak bisa dipencet” lagi:

* hanya mesh panel yang punya pointer events; dekor/partikel/background jangan ikut menangkap event
* depth/ordering jelas; jangan ada plane full-screen transparan yang menutupi semuanya.

Panel motion memakai `computePanelTarget()` dari `panelMotion.ts`, jadi semua hover/pressed/preview konsisten. Setelah itu, baru kamu tambahkan logika orbit placement (azimuth/radius/height) sesuai blueprint yang sudah kita kunci.

Saat panel diklik dan menuju route 2D, kamu hitung `origin rect` dari panel plane memakai `getScreenRectFromPlaneMesh(mesh, camera, viewport)` dan kirim ke navigator. Ini yang bikin portal terasa “keluar dari panel”.

## Black hole “selalu terlihat sedikit di kiri” + safe cone agar panel tidak menutupi

Begitu ring panel stabil, kamu masuk black hole. Targetnya: pada yaw default, black hole hanya “sliver” di kiri (kesan semesta). Saat user yaw ke kiri, black hole jadi jelas.

Secara implementasi, black hole jadi objek jauh di kiri-depan dengan parameter dari `TOKENS.galaxy.blackHole`. Lalu kamu aktifkan “BH safe cone”: panel yang berada di rentang azimuth sekitar [-95°, -35°] diberi push radius dan naik Y ketika kamera sedang mengarah ke zona reveal. Ini bikin black hole tidak pernah ketutup panel secara visual saat momen reveal.

Zodiac kamu taruh di radius jauh dan highlight cone di sisi kanan (20°–160°). Di saat black hole sedang dominan, zodiac di sisi black hole dibuat lebih redup, sedangkan sisi kanan tetap terlihat. Ini menjaga komposisi yang kamu minta.

## Search bar + keyboard hologram: reveal by pitch, bukan klik

Setelah galaxy terasa “hidup”, baru masuk keyboard hologram. Kontraknya: keyboard “selalu ada” tapi baru jelas saat user menunduk. Jadi kamu implement pitch threshold dari `TOKENS.galaxy.search`:

* saat pitch melewati `pitchRevealStartDeg` menuju `pitchRevealFullDeg`, keyboard glow dan opacity naik, dan search bar tertarik turun sedikit.
* saat pitch balik, keyboard memudar lagi tapi tidak hilang total.

Karena ini basisnya pitch, bukan event klik, dia tidak mengganggu flow navigasi panel.

## Pages 2D: satu template kuat, lalu isi halaman satu per satu

Halaman 2D kamu jangan dibangun masing-masing “gaya beda”. Kamu bikin `PagesLayout` yang memegang semua DNA 2D: background starfield halus, black hole sliver kiri, surface glassy, header sticky dengan breadcrumb + Back to Galaxy.

Di layout ini juga kamu terapkan `useRouteTheme(pathname)` yang mengisi `data-oph-profile` dan `--oph-accent` otomatis dari mapping route. Jadi docs/news/contact langsung punya aksen yang tepat tanpa kamu mikir ulang.

Begitu layout ini jadi, halaman pertama yang paling “mengunci kualitas baca” adalah Docs. Waktu Docs sudah enak, Projects, News, Media, Gallery, Team, Contact jadi jauh lebih gampang karena mereka cuma variasi struktur di atas surface yang sama.

## Game panel: fokus panel 3D dulu, tombol store pakai portal store

Game panel berbeda: klik dari orbit masuk FocusPanelMode (in-realm zoom) yang menampilkan video besar + deskripsi. Di dalam panel besar itu, tombol Steam/itch/Play Store memicu portal eksternal profile `store`, dengan origin dari video frame (bukan teks), lalu buka tab baru (default premium) supaya portal tidak kepotong.

Di titik ini, web kamu sudah punya “wow path” yang lengkap: landing semesta → fokus game → portal download.

## QA yang penting untuk menghindari masalah “lapisan nindih” dan “klik mati”

Di akhir setiap integrasi besar (Galaxy interaksi, PortalOverlay, PagesLayout), kamu biasakan cek dua hal: raycast hanya kena panel yang benar, dan PortalOverlay tidak pernah menangkap event (pointer-events none). Kamu juga cek portal swap tidak pernah memunculkan blank dengan cara menunda render konten halaman, tapi header+surface harus langsung mount lalu `markDestinationReady()`.

## Urutan kerja yang paling aman supaya cepat jadi tanpa ngulang

Kamu bisa anggap implementasi “selesai dan tinggal isi konten” ketika ini sudah jalan mulus: klik panel → preview 0.28s → portal → masuk halaman 2D template → back to galaxy via portal reverse → posisi galaxy resume, plus tombol store dari Game panel membuka link eksternal via portal.

Kalau kamu mau, aku bisa lanjut bikin “kerangka folder proyek” yang rapi (app shell, galaxy, portal, pages, content), sekalian contoh minimal `AppShell.tsx` yang menghubungkan `PortalController + PortalOverlay + Router + GalaxyCanvas + PagesLayout` supaya kamu tinggal copy dan mulai implement.

Siap. Ini kerangka folder yang “bersih dan scalable” buat konsep 2-realm kamu (Galaxy 3D + Pages 2D) dengan PortalOverlay global yang selalu hidup. Aku susun ini supaya kamu tinggal implement modul per modul tanpa angka hardcode nyebar, dan tanpa risiko “layer nindih jadi nggak bisa dipencet”.

```txt
apps/web/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  public/
    posters/
    videos/
    textures/
  src/
    main.tsx
    app/
      router.tsx
      AppShell.tsx
      hooks/
        useRaf.ts
      layout/
        PagesLayout.tsx
        GalaxyLandingOverlay.tsx
    theme/
      tokens.ts
    singletons/
      portalSingleton.ts
    portal/
      PortalOverlay.tsx
      portalOverlay.css
      portalController.ts
      navigateWithPortal.ts
      screenRectFromPanel.ts
    galaxy/
      GalaxyCanvas.tsx
      scene/
        GalaxyScene.tsx
        rigs/
          CameraRig.tsx
          InteractionRig.tsx
          SearchRig.tsx
        entities/
          BlackHole.tsx
          Zodiac.tsx
          Starfield.tsx
        ui/
          PanelRing.tsx
          PlanetHub.tsx
          FocusPanelMode.tsx
      panels/
        panelRegistry.ts
        PanelMesh.tsx
        panels/
          GamePanel.tsx
          DocsPanel.tsx
          ProjectsPanel.tsx
          TeamPanel.tsx
          GalleryPanel.tsx
          MediaPanel.tsx
          NewsPanel.tsx
          ContactPanel.tsx
      interactions/
        panelMotion.ts
        usePanelRaycast.ts
        usePanelPointer.ts
      materials/
        holoPanelMaterial.ts
        blackHoleMaterial.ts
        starfieldMaterial.ts
      data/
        panels.ts
    pages/
      docs/
        DocsIndex.tsx
        DocsPage.tsx
      projects/
        ProjectsIndex.tsx
        ProjectDetail.tsx
      news/
        NewsIndex.tsx
        NewsDetail.tsx
      media/
        MediaIndex.tsx
      gallery/
        GalleryIndex.tsx
      team/
        TeamIndex.tsx
      contact/
        ContactIndex.tsx
      games/
        GamesIndex.tsx
        GameDetail.tsx
      utility/
        About.tsx
        Roadmap.tsx
        Status.tsx
        Support.tsx
    content/
      docs/
        engine/
          getting-started.mdx
          black-hole-shader.mdx
      projects/
        ophiucus-site.json
      games/
        astral-sentinel.json
      news/
        2025/
          devlog-01.mdx
      media/
        trailers.json
        press-kit.json
      gallery/
        concept-art.json
    components/
      ui/
        Header.tsx
        Breadcrumb.tsx
        Surface.tsx
        Button.tsx
      common/
        ErrorBoundary.tsx
        LoadingSkeleton.tsx
    styles/
      tokens.css
      global.css
```

Kerangka ini sengaja memisahkan tiga hal besar. Folder `galaxy/` hanya berisi dunia 3D dan interaksinya. Folder `pages/` hanya berisi halaman 2D. Folder `portal/` hanya berisi mesin transisi Link Start yang jadi “bahasa navigasi”. Folder `theme/` memegang `tokens.ts` sebagai sumber kebenaran supaya semua timing/glow/density portal bisa di-tune satu tempat.

Di bawah ini contoh minimal file yang langsung menyambungkan semuanya: `router.tsx`, `AppShell.tsx`, `PagesLayout.tsx`, `GalaxyCanvas.tsx`, dan singleton portal. Ini sudah mengikuti kontrak: preview fokus 0.28 detik, portal swap aman, Pages memberi sinyal “minimal ready”.

---

## `vite.config.ts` (alias @ biar import rapi)

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

---

## `src/singletons/portalSingleton.ts`

```ts
import { PortalController } from "@/portal/portalController";

export const portalSingleton = new PortalController();
```

---

## `src/app/router.tsx` (nested routes: satu shell untuk semua)

```tsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AppShell from "@/app/AppShell";

import DocsIndex from "@/pages/docs/DocsIndex";
import DocsPage from "@/pages/docs/DocsPage";

import ProjectsIndex from "@/pages/projects/ProjectsIndex";
import ProjectDetail from "@/pages/projects/ProjectDetail";

import NewsIndex from "@/pages/news/NewsIndex";
import NewsDetail from "@/pages/news/NewsDetail";

import MediaIndex from "@/pages/media/MediaIndex";
import GalleryIndex from "@/pages/gallery/GalleryIndex";
import TeamIndex from "@/pages/team/TeamIndex";
import ContactIndex from "@/pages/contact/ContactIndex";

import GamesIndex from "@/pages/games/GamesIndex";
import GameDetail from "@/pages/games/GameDetail";

import About from "@/pages/utility/About";
import Roadmap from "@/pages/utility/Roadmap";
import Status from "@/pages/utility/Status";
import Support from "@/pages/utility/Support";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: null }, // landing galaxy ada di AppShell (realm 3D)
      { path: "galaxy", element: null },

      { path: "docs", element: <DocsIndex /> },
      { path: "docs/:section/:page", element: <DocsPage /> },

      { path: "projects", element: <ProjectsIndex /> },
      { path: "projects/:projectSlug", element: <ProjectDetail /> },

      { path: "news", element: <NewsIndex /> },
      { path: "news/:postSlug", element: <NewsDetail /> },

      { path: "media", element: <MediaIndex /> },
      { path: "gallery", element: <GalleryIndex /> },
      { path: "team", element: <TeamIndex /> },
      { path: "contact", element: <ContactIndex /> },

      { path: "games", element: <GamesIndex /> },
      { path: "games/:gameSlug", element: <GameDetail /> },

      { path: "about", element: <About /> },
      { path: "roadmap", element: <Roadmap /> },
      { path: "status", element: <Status /> },
      { path: "support", element: <Support /> },
    ],
  },
]);
```

---

## `src/main.tsx` (RouterProvider + global styles)

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";

import "@/styles/tokens.css";
import "@/styles/global.css";
import "@/portal/portalOverlay.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

---

## `src/app/hooks/useRaf.ts` (tick global, dipakai untuk portal)

```ts
import { useEffect, useRef } from "react";

export function useRaf(cb: (t: number) => void, enabled: boolean = true) {
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const loop = (t: number) => {
      cb(t);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [cb, enabled]);
}
```

---

## `src/app/layout/PagesLayout.tsx` (2D template: bg starfield + BH sliver + header breadcrumb + ready signal)

```tsx
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { portalSingleton } from "@/singletons/portalSingleton";
import { useRouteTheme } from "@/pages/theme/useRouteTheme";
import Header from "@/components/ui/Header";
import Surface from "@/components/ui/Surface";

export default function PagesLayout() {
  const loc = useLocation();
  useRouteTheme(loc.pathname);

  useEffect(() => {
    portalSingleton.markDestinationReady();
  }, [loc.pathname]);

  return (
    <div className="oph-page-bg">
      <div className="oph-bh-sliver" />
      <Header />
      <main style={{ padding: "28px 16px" }}>
        <Surface>
          <Outlet />
        </Surface>
      </main>
    </div>
  );
}
```

Catatan: kalau kamu mau PagesLayout hanya muncul saat route 2D aktif, itu kita atur dari `AppShell.tsx` dengan conditional render.

---

## `src/app/AppShell.tsx` (inti: GalaxyCanvas + PagesLayout + PortalOverlay + navigator)

```tsx
import React, { useCallback, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import GalaxyCanvas from "@/galaxy/GalaxyCanvas";
import PortalOverlay from "@/portal/PortalOverlay";
import { portalSingleton } from "@/singletons/portalSingleton";
import { createNavigator } from "@/portal/navigateWithPortal";
import { useRaf } from "@/app/hooks/useRaf";
import PagesLayout from "@/app/layout/PagesLayout";

export default function AppShell() {
  const loc = useLocation();
  const navigate = useNavigate();

  const isGalaxy = loc.pathname === "/" || loc.pathname === "/galaxy";

  const openExternal = useCallback((url: string, newTab: boolean) => {
    if (newTab) window.open(url, "_blank", "noopener,noreferrer");
    else window.location.href = url;
  }, []);

  const nav = useMemo(() => {
    return createNavigator(portalSingleton, {
      navigateInternal: (toPath) => navigate(toPath),
      openExternal,
    });
  }, [navigate, openExternal]);

  useRaf(() => {
    nav.tick();
  }, true);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <GalaxyCanvas active={isGalaxy} navigator={nav} />
      {!isGalaxy ? <PagesLayout /> : <Outlet />}
      <PortalOverlay portal={portalSingleton} />
    </div>
  );
}
```

Di sini `GalaxyCanvas` menerima `active` untuk mengaktifkan pointer events dan render loop secukupnya, dan menerima `navigator` supaya panel 3D bisa memanggil `nav.toPath()` atau `nav.toExternal()` tanpa perlu tahu portal profile/durasi.

---

## `src/galaxy/GalaxyCanvas.tsx` (Canvas 3D yang bisa dipause dan tidak ganggu 2D)

```tsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import GalaxyScene from "@/galaxy/scene/GalaxyScene";

export default function GalaxyCanvas({
  active,
  navigator,
}: {
  active: boolean;
  navigator: any;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: active ? "auto" : "none",
        opacity: 1,
      }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 50, near: 0.1, far: 350, position: [0, 2, 18] }}
      >
        <GalaxyScene active={active} navigator={navigator} />
      </Canvas>
    </div>
  );
}
```

---

## `src/galaxy/scene/GalaxyScene.tsx` (placeholder scene; nanti dipecah sesuai blueprint)

```tsx
import React from "react";
import CameraRig from "@/galaxy/scene/rigs/CameraRig";
import InteractionRig from "@/galaxy/scene/rigs/InteractionRig";
import BlackHole from "@/galaxy/scene/entities/BlackHole";
import Zodiac from "@/galaxy/scene/entities/Zodiac";
import PanelRing from "@/galaxy/scene/ui/PanelRing";
import PlanetHub from "@/galaxy/scene/ui/PlanetHub";
import SearchRig from "@/galaxy/scene/rigs/SearchRig";

export default function GalaxyScene({ active, navigator }: { active: boolean; navigator: any }) {
  return (
    <>
      <CameraRig active={active} />
      <InteractionRig active={active} />

      <BlackHole active={active} />
      <Zodiac active={active} />

      <PanelRing active={active} navigator={navigator} />
      <PlanetHub active={active} />
      <SearchRig active={active} />
    </>
  );
}
```

---

## `src/styles/global.css` (minimum agar layer aman)

```css
html, body, #root {
  width: 100%;
  height: 100%;
  margin: 0;
}

.oph-page-bg {
  position: absolute;
  inset: 0;
  overflow: auto;
}

.oph-bh-sliver {
  /* nanti kamu bisa ganti dengan gambar / canvas ringan */
  background: radial-gradient(600px 600px at 20% 55%, rgba(140,200,255,0.16), transparent 55%);
  mask-image: linear-gradient(90deg, #000 0%, #000 55%, transparent 100%);
}
```

---

Kalau kamu sudah pasang struktur ini, titik “besar” berikutnya yang biasanya langsung bikin web kamu terasa hidup adalah `PanelRing.tsx` + `usePanelRaycast.ts` yang memastikan hanya panel mesh yang menangkap klik, lalu memanggil `navigator.toPath("/docs", originRect)` dan sejenisnya. Setelah itu, PortalOverlay akan otomatis “kelihatan” saat navigasi, dan PagesLayout akan otomatis ngasih sinyal ready supaya tidak ada blank.