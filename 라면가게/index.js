let bgStatus = 0;

document.addEventListener("[①]", async () => {
    const game = document.[②]("#game");
    const mainBg = document.[③]("#mainBg");
    const howToBtn = document.[④]("#howToBtn");
    const gameBtn = document.[⑤]("#gameBtn");

    // 메인 화면
    game.addEventListener("[⑥]", () => {
        if (bgStatus !== 1) return;

        mainBg.src = "/assets/images/backgrounds/main.png";
        howToBtn.style.display = [⑦];
        gameBtn.style.display = [⑧];
        bgStatus = 0;
    });

    // 게임 방법
    howToBtn.addEventListener("[⑨]", () => {
        mainBg.src = "/assets/images/backgrounds/tutorial.png";
        howToBtn.style.display = "[⑩]";
        gameBtn.style.display = "[⑪]";

        setTimeout(() => {
            // 바로 바꾸면 안 떠서 0.1초 뒤에 바꾸기
            bgStatus = 1;
        }, 100);
    });

    // 증기 소리 재생
    const steam = new AudioPlayer("/assets/sounds/sfx/steam_short.mp3");
    await steam.load();

    howToBtn.addEventListener("mouseenter", () => {
        steam.play();
    });

    gameBtn.addEventListener("mouseenter", () => {
        steam.play();
    });

    // BGM 재생 (위치, 반복 여부, BGM 길이)
    const player = new AudioPlayer("/assets/sounds/bgm/main.mp3", true, 4.324);
    await player.load();
    player.play();
});
