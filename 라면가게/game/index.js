// ============================================================
// index.js — 슈의 라면가게 게임 로직
//
// 읽는 순서 추천:
// 1) 상수 / 상태 변수
// 2) 화면 업데이트 함수
// 3) 냄비 들기·놓기·서빙
// 4) 클릭 / 마우스 이동 이벤트
//
// 어려운 DOM 처리는 library.js 에 있습니다.
// ============================================================

// #region 변수 선언
 
// ---------- HTML 요소 ----------
const canvas = document.[①]("canvas");// 클래스로 불러옴
const gameContainer = document.querySelector(".game-container");
const cursorImage = document.[②]("cursorImage");//아이디로 불러옴
const kettle = document.getElementById("pot");
const scoreDisplay = document.getElementById("scoreDisplay");
const hudTimer = document.getElementById("hudTimer");
const timerFill = document.getElementById("timerFill");
const heldCookingPot = document.getElementById("heldCookingPot");
const hudCustomer = document.getElementById("hudCustomer");
 
// ---------- 게임 설정 ----------
const TOTAL_TIME = 60; // 제한 시간(초)
const RAMEN_PRICE = 1000; // 라면 한 그릇 가격
const WIN_SCORE = 10000; // 이 점수보다 크면 성공
const MIN_BOIL_TIME = 5; // 최소 끓이는 시간(초)
 
// 냄비 상태 배열 한 칸의 의미
// [0] 계란  [1] 면  [2] 스프  [3] 파  [4] 물  [5] 끓인 시간
const EGG = 0;
const NOODLES = 1;
const SOUP = 2;
const GREEN_ONION = 3;
const WATER = 4;
const BOIL_TIME = 5;
 
// 클릭 영역 id
const ZONE_EGG = 0;
const ZONE_NOODLES = 1;
const ZONE_SOUP = 2;
const ZONE_GREEN_ONION = 3;
const ZONE_KETTLE = 4;
const ZONE_POT_1 = 5;
const ZONE_POT_2 = 6;
const ZONE_POT_3 = 7;
const ZONE_POT_4 = 8;
const ZONE_TRAY = 9;
 
// ---------- 게임 상태 ----------
let money = [③];
let timeLeft = TOTAL_TIME;
let gamePlaying = true;

// 지금 손에 든 재료/주전자의 zone id (없으면 null)
let holdingItemId = [④];

// 지금 들고 있는 냄비 번호 0~3 (없으면 null)
let holdingPotIndex = null;

// 냄비 4개의 상태
let pots = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
];

// 손님 말풍선 timeout
let customerBallonTimeout = -1;

// ---------- 효과음 ----------
const SFX_DISH_WASH = new AudioPlayer("/assets/sounds/sfx/dish_wash.mp3");
const SFX_BOILING = new AudioPlayer("/assets/sounds/sfx/boiling.mp3");
const SFX_CUSTOMER_TAKE = new AudioPlayer("/assets/sounds/sfx/customer_take.mp3");
const SFX_CUSTOMER_REJECT = new AudioPlayer("/assets/sounds/sfx/customer_reject.mp3");
const SFX_EGG = new AudioPlayer("/assets/sounds/sfx/egg.mp3");
const SFX_GREEN_ONION = new AudioPlayer("/assets/sounds/sfx/green_onion.mp3");
const SFX_POUR_WATER = new AudioPlayer("/assets/sounds/sfx/pour_water.mp3");
const SFX_SOUP = new AudioPlayer("/assets/sounds/sfx/soup.mp3");
const SFX_STEAM = new AudioPlayer("/assets/sounds/sfx/steam.mp3");
const SFX_NOODLES = new AudioPlayer("/assets/sounds/sfx/noodles.mp3");
const BGM = new AudioPlayer("/assets/sounds/bgm/game.mp3", true, 10.65);
const BGM_SUCCESS = new AudioPlayer("/assets/sounds/bgm/good_end.mp3", true, 10.9);
const BGM_FAIL = new AudioPlayer("/assets/sounds/bgm/bad_end.mp3");

// ---------- 이미지 / 위치 데이터 ----------
const backgrounds = {
    game: 'url("/assets/images/backgrounds/game.png")',
    success: 'url("/assets/images/backgrounds/good_end.png")',
    failed: 'url("/assets/images/backgrounds/bad_end.png")',
};

// 손에 들 때 커서에 붙는 이미지 (zone id 0~4)
const handImages = [
    "egg.png",
    "noodles.png",
    "soup.png",
    "green_onion.png",
    "pot_handle.png",
];

// 냄비 안에 넣을 때 보이는 이미지 (재료 0~3)
const potIngredientImages = [
    "egg_in_cooking_pot.png",
    "noodles_in_cooking_pot.png",
    "soup_in_cooking_pot.png",
    "green_onion_in_cooking_pot.png",
];

// 그리는 순서: 면 -> 파 -> 계란 -> 스프
const DRAW_ORDER = [NOODLES, GREEN_ONION, EGG, SOUP];

// 클릭할 수 있는 영역
const clickZones = [
    { id: ZONE_EGG, x: 125, y: 80, width: 100, height: 50 },
    { id: ZONE_NOODLES, x: 10, y: 80, width: 100, height: 50 },
    { id: ZONE_SOUP, x: 10, y: 20, width: 100, height: 50 },
    { id: ZONE_GREEN_ONION, x: 125, y: 20, width: 100, height: 50 },
    { id: ZONE_KETTLE, x: 290, y: 200, width: 100, height: 150 },
    { id: ZONE_POT_1, x: 40, y: 195, width: 90, height: 70 },
    { id: ZONE_POT_2, x: 5, y: 270, width: 90, height: 70 },
    { id: ZONE_POT_3, x: 145, y: 270, width: 90, height: 70 },
    { id: ZONE_POT_4, x: 195, y: 177, width: 90, height: 70 },
    { id: ZONE_TRAY, x: 370, y: 200, width: 200, height: 120 },
];

// 물 붓기 애니메이션 위치
const pourPositions = [
    { bottom: "235px", left: "80px" },
    { bottom: "160px", left: "30px" },
    { bottom: "160px", left: "170px" },
    { bottom: "215px", left: "225px" },
];

// #endregion


// #region 화면 업데이트

function setBackground(name) {
    canvas.style.backgroundImage = backgrounds[name] || backgrounds.game;
}

function showScore() {
    scoreDisplay.textContent = money.toLocaleString();
}

function showTimer() {
    const percent = Math.max(0, (timeLeft / TOTAL_TIME) * 100);
    timerFill.style.width = percent + "%";
}

function refreshPot(potIndex) {
    redrawPotIngredients(potIndex, pots[potIndex], DRAW_ORDER, potIngredientImages);
    updateWaterLayer(potIndex, pots[potIndex], MIN_BOIL_TIME);
}

function clearHand() {
    holdingItemId = [⑤];
    kettle.style.display = "block";
    cursorImage.style.display = "none";
}

function showCustomerBallon(text) {
    // 이미 풍선이 있다면 없애기
    if (customerBallonTimeout >= 0) {
        [⑥](customerBallonTimeout);
    }

    hudCustomer.innerText = text;
    hudCustomer.removeAttribute("style");

    // 1초 뒤 되돌리기
    customerBallonTimeout = [⑦](() => {
        hudCustomer.innerText = "";
        hudCustomer.style.display = "none";
        customerBallonTimeout = -1;
    }, 1000);
}

// #endregion


// #region 냄비 들기 / 놓기 / 서빙

function moveHeldPot(x, y) {
    heldCookingPot.style.left = x + "px";
    heldCookingPot.style.top = y + "px";
}

function pickUpPot(potIndex, x, y) {
    holdingPotIndex = potIndex;
    const parts = getPotElements(potIndex + 1);

    heldCookingPot.[⑧](parts.pot, parts.clip, parts.water, parts.guard);
    heldCookingPot.style.display = "block";
    moveHeldPot(x, y);
    updateWaterLayer(potIndex, pots[potIndex], MIN_BOIL_TIME);
    cursorImage.style.display = "none";
}

function putDownPot(potIndex) {
    const parts = getPotElements(potIndex + 1);

    gameContainer.[⑨](parts.pot, heldCookingPot);
    gameContainer.insertBefore(parts.clip, heldCookingPot);
    gameContainer.insertBefore(parts.water, heldCookingPot);
    gameContainer.insertBefore(parts.guard, heldCookingPot);

    parts.pot.style.cssText = "";
    parts.clip.style.cssText = "";
    parts.water.style.cssText = "";
    parts.guard.style.cssText = "";

    heldCookingPot.style.display = "none";
    updateWaterLayer(potIndex, pots[potIndex], MIN_BOIL_TIME);
}

function resetPot(potIndex) {
    pots[potIndex] = [0, 0, 0, 0, 0, 0];
    refreshPot(potIndex);
}

function isRamenReady(potIndex) {
    const pot = pots[potIndex];
    return (
        pot[EGG] [⑩] 1 &&
        pot[NOODLES] === 1 &&
        pot[SOUP] === 1 &&
        pot[GREEN_ONION] === 1 &&
        pot[WATER] === 1 &&
        pot[BOIL_TIME] [⑪] MIN_BOIL_TIME
    );
}

function servePot(potIndex) {
    SFX_DISH_WASH.play();

    if ([⑫](potIndex)) {
        showCustomerBallon("아이맛잇어");
        SFX_CUSTOMER_TAKE.play();
        money = money [⑬] RAMEN_PRICE;
        showScore();
        putDownPot(potIndex);
        resetPot(potIndex);
        return;
    }

    showCustomerBallon("지금 장난해?");

    SFX_CUSTOMER_REJECT.play();
    putDownPot(potIndex);
    resetPot(potIndex);
}

function pourWater(potIndex) {
    const pourImg = document.createElement("img");
    pourImg.className = "pour-animation";
    pourImg.src = "/assets/images/game_assets/pot_pouring.png";
    pourImg.style.bottom = pourPositions[potIndex].bottom;
    pourImg.style.left = pourPositions[potIndex].left;
    gameContainer.appendChild(pourImg);

    SFX_POUR_WATER.play();

    setTimeout(function () {
        pourImg.[⑭]();
        refreshPot(potIndex);
    }, 600);
}

function holdItem(itemId, x, y) {
    holdingItemId = itemId;

    if (itemId === ZONE_KETTLE) {
        kettle.style.display = "none";
        cursorImage.style.maxWidth = "none";
    } else {
        kettle.style.display = "block";
        cursorImage.style.maxWidth = "130px";
    }

    cursorImage.src = "/assets/images/game_assets/" + handImages[itemId];
    cursorImage.style.display = "block";
    cursorImage.style.left = x + "px";
    cursorImage.style.top = y + "px";
}

function returnHeldThings() {
    if (holdingPotIndex !== null) {
        putDownPot(holdingPotIndex);
        holdingPotIndex = null;
    } else if (holdingItemId !== null) {
        [⑮]();
    }
}

// #endregion


// #region 게임 시작 / 종료 / 타이머

function endGame() {
    gamePlaying = [⑯];
    returnHeldThings();

    gameContainer.classList.add("game-ended");
    hudTimer.style.display = "none";

    BGM.stop();

    if (money [⑰] WIN_SCORE) {
        gameContainer.classList.add("game-success");
        setBackground("success");
        BGM_SUCCESS.play();
    } else {
        gameContainer.classList.add("game-failed");
        setBackground("failed");
        BGM_FAIL.play();
    }

    showScore();
    cursorImage.style.display = "none";
    kettle.style.display = "none";
    holdingItemId = null;
    holdingPotIndex = null;
}

function startTimers() {
    // 1초마다: 물이 있는 냄비의 끓인 시간 +1
    [⑱](function () {
        if (!gamePlaying) return;

        for (let i = 0; i < 4; i++) {
            const hasWater = pots[i][WATER] === 1;
            const isHeld = holdingPotIndex === i;

            if (hasWater && !isHeld) {
                pots[i][BOIL_TIME] = pots[i][BOIL_TIME] [⑲] 1;

                if (pots[i][BOIL_TIME] === MIN_BOIL_TIME) {
                    refreshPot(i);
                    SFX_BOILING.play();
                }
            }
        }
    }, [⑳]);

    // 1초마다: 남은 시간 -1
    setInterval(function () {
        if (!gamePlaying) return;

        timeLeft = timeLeft - 1;
        showTimer();

        if (timeLeft [㉑] 0) {
            endGame();
        }
    }, 1000);
}

// #endregion


// #region 클릭 처리

function isIngredient(id) {
    return id === ZONE_EGG ||
           id === ZONE_NOODLES ||
           id === ZONE_SOUP ||
           id === ZONE_GREEN_ONION;
}

function isPotZone(id) {
    return id >= ZONE_POT_1 && id [㉒] ZONE_POT_4;
}

function potIndexFromZone(zoneId) {
    return zoneId - ZONE_POT_1;
}

function onGameClick(event) {
    if (!gamePlaying) return;

    const mouse = getMouseInCanvas(event, canvas);
    const zone = findZoneAt(mouse.x, mouse.y, clickZones);

    // 1) 허공 클릭 → 들고 있던 것 내려놓기
    if (zone === [㉓]) {
        returnHeldThings();
        return;
    }

    const potIndex = potIndexFromZone(zone);

    // 2) 트레이 클릭 → 냄비를 들고 있을 때만 서빙
    if (zone.id === ZONE_TRAY) {
        if (holdingPotIndex !== null) {
            const served = holdingPotIndex;
            holdingPotIndex = null;
            servePot(served);
        }

        return;
    }

    // 3) 주전자를 든 채로 주전자 자리 다시 클릭 → 내려놓기
    if (holdingItemId === ZONE_KETTLE && zone.id === ZONE_KETTLE) {
        clearHand();
        return;
    }

    // 4) 재료를 들고 냄비 클릭 → 재료 넣기
    if (isIngredient(holdingItemId) && [㉔](zone.id)) {
        if (pots[potIndex][holdingItemId] === 1) return;

        switch (holdingItemId) {
            case 0:
                SFX_EGG.play();
                break;
            case 1:
                SFX_NOODLES.play();
                break;
            case 2:
                SFX_SOUP.play();
                break;
            case 3:
                SFX_GREEN_ONION.play();
                break;
        }

        pots[potIndex][holdingItemId] = [㉕];
        refreshPot(potIndex);
        holdingItemId = null;
        return;
    }

    // 5) 주전자를 들고 냄비 클릭 → 물 붓기
    if (holdingItemId === ZONE_KETTLE && isPotZone(zone.id)) {
        if (pots[potIndex][WATER] === 0) {
            pots[potIndex][WATER] = 1;
            [㉖](potIndex);
            clearHand();
        }

        return;
    }

    // 6) 냄비 클릭 → 들기 / 내려놓기
    if (isPotZone(zone.id)) {
        if (holdingPotIndex === potIndex) {
            holdingPotIndex = null;
            putDownPot(potIndex);
        } else if (holdingItemId === null && holdingPotIndex === null) {
            [㉗](potIndex, mouse.x, mouse.y);
        }

        return;
    }

    // 7) 재료 / 주전자 클릭 → 손에 들기
    if (zone.id <= ZONE_KETTLE) {
        holdItem(zone.id, mouse.x, mouse.y);
    }
}

function onGameMouseMove(event) {
    if (!gamePlaying) return;

    const mouse = getMouseInCanvas(event, canvas);
    const zone = findZoneAt(mouse.x, mouse.y, clickZones);

    canvas.style.cursor = zone !== null ? "pointer" : "default";

    if (holdingPotIndex !== null) {
        moveHeldPot(mouse.x, mouse.y);
    } else if (holdingItemId !== null) {
        cursorImage.style.left = mouse.x + "px";
        cursorImage.style.top = mouse.y + "px";
    } else {
        cursorImage.style.display = [㉘];
    }
}

// #endregion


// #region 게임 시작

setBackground("game");
showScore();
showTimer();
[㉙]();

canvas.[㉚]("click", onGameClick);
canvas.addEventListener("mousemove", onGameMouseMove);

document.addEventListener("DOMContentLoaded", async () => {
    // 효과음 / 배경음 로딩
    await SFX_DISH_WASH.load();
    await SFX_BOILING.load();
    await SFX_CUSTOMER_TAKE.load();
    await SFX_CUSTOMER_REJECT.load();
    await SFX_EGG.load();
    await SFX_GREEN_ONION.load();
    await SFX_POUR_WATER.load();
    await SFX_SOUP.load();
    await SFX_STEAM.load();
    await SFX_NOODLES.load();
    await BGM.load();
    await BGM_SUCCESS.load();
    await BGM_FAIL.load();

    // BGM 재생
    await BGM.play();
});

// #endregion
