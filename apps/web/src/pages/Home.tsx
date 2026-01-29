export function Home() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 20, top: 18, color: "rgba(255,255,255,0.86)", fontWeight: 900 }}>
        Ophius Studio
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 44,
          color: "rgba(255,255,255,0.58)",
          maxWidth: 560,
          lineHeight: 1.45
        }}
      >
        Klik panel di ring untuk ngetes portal. Geser kamera: klik kanan + tarik (atau klik kiri + tarik di area kosong). Scroll untuk zoom. Kalau kamu pindah ke halaman 2D, kamu selalu bisa balik lewat tombol “Back to Galaxy”. 
      </div>
    </div>
  );
}
