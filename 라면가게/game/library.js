// ============================================================
// library.js
// 게임에서 쓰는 "도구 함수" 모음입니다.
// game/index.js 는 게임 규칙만 읽고, 복잡한 처리는 여기서 합니다.
// ============================================================

/**
 * 마우스가 클릭 영역 안에 있는지 확인합니다.
 * @param {number} mouseX
 * @param {number} mouseY
 * @param {{ x: number, y: number, width: number, height: number }} zone
 * @returns {boolean}
 */
function isInsideZone(mouseX, mouseY, zone) {
    return (
        mouseX >= zone.x &&
        mouseX <= zone.x + zone.width &&
        mouseY >= zone.y &&
        mouseY <= zone.y + zone.height
    );
}

/**
 * 클릭한 위치의 영역을 찾습니다. 없으면 null 을 돌려줍니다.
 * @param {number} mouseX
 * @param {number} mouseY
 * @param {Array} zones
 * @returns {object | null}
 */
function findZoneAt(mouseX, mouseY, zones) {
    for (let i = 0; i < zones.length; i++) {
        if (isInsideZone(mouseX, mouseY, zones[i])) {
            return zones[i];
        }
    }
    return null;
}

/**
 * 캔버스 안에서의 마우스 좌표를 구합니다.
 * @param {MouseEvent} event
 * @param {HTMLElement} canvas
 * @returns {{ x: number, y: number }}
 */
function getMouseInCanvas(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}

/**
 * n번 냄비의 HTML 요소들을 모아서 돌려줍니다. (1~4번)
 * @param {number} potNumber
 */
function getPotElements(potNumber) {
    return {
        pot: document.querySelector(".cooking-pot.pot" + potNumber),
        clip: document.querySelector(".pot" + potNumber + "-clip"),
        water: document.querySelector(".pot" + potNumber + "-water"),
        guard: document.querySelector(".cooking-pot-guard.pot" + potNumber),
    };
}

/**
 * 스프를 넣었을 때 보이는 작은 점들을 만듭니다.
 * @param {number} potIndex 0~3
 * @returns {HTMLElement}
 */
function createSoupDots(potIndex) {
    const dots = document.createElement("div");
    dots.className = "soup-dots cooking-pot-item";
    dots.dataset.cookingPot = String(potIndex);

    // 점 위치 (%) — 냄비 안쪽에 흩어져 보이게
    const positions = [
        [22, 38],
        [38, 32],
        [52, 40],
        [30, 52],
        [46, 48],
        [58, 52],
        [34, 62],
        [50, 58],
        [42, 42],
        [56, 44],
    ];

    for (let i = 0; i < positions.length; i++) {
        const left = positions[i][0];
        const top = positions[i][1];
        const dot = document.createElement("span");
        dot.className = "soup-dot";
        dot.style.left = left + "%";
        dot.style.top = top + "%";
        dots.appendChild(dot);
    }

    return dots;
}

/**
 * 냄비 안 재료 그림을 다시 그립니다.
 * @param {number} potIndex 0~3
 * @param {number[]} potStatus [계란, 면, 스프, 파, 물, 시간]
 * @param {number[]} drawOrder 그리는 순서 (예: 면 → 계란 → 파 → 스프)
 * @param {string[]} ingredientImages 재료 이미지 파일 이름
 */
function redrawPotIngredients(potIndex, potStatus, drawOrder, ingredientImages) {
    const potNumber = potIndex + 1;
    const clip = document.querySelector(".pot" + potNumber + "-clip");
    if (!clip) return;

    // 예전 재료 그림 지우기
    const oldItems = clip.querySelectorAll(
        '.cooking-pot-item[data-cooking-pot="' + potIndex + '"]',
    );
    for (let i = 0; i < oldItems.length; i++) {
        oldItems[i].remove();
    }

    // 순서대로 다시 그리기
    for (let i = 0; i < drawOrder.length; i++) {
        const ingredientId = drawOrder[i];
        if (!potStatus[ingredientId]) continue;

        // 스프(id 2)는 점 무늬로 표시
        if (ingredientId === 2) {
            clip.appendChild(createSoupDots(potIndex));
            continue;
        }

        const img = document.createElement("img");
        img.className = "indicator cooking-pot-item";
        img.dataset.cookingPot = String(potIndex);
        img.src = "/assets/images/game_assets/" + ingredientImages[ingredientId];
        clip.appendChild(img);
    }
}

/**
 * 물/스프 물 레이어를 켜거나 끕니다.
 * @param {number} potIndex 0~3
 * @param {number[]} potStatus
 * @param {number} minBoilTime 거품이 생기기 시작하는 시간
 */
function updateWaterLayer(potIndex, potStatus, minBoilTime) {
    const potNumber = potIndex + 1;
    const water = document.querySelector(".pot" + potNumber + "-water");
    if (!water) return;

    const hasWater = potStatus[4] === 1;
    const hasSoup = potStatus[2] === 1;
    const isBoiling = potStatus[5] >= minBoilTime;

    if (!hasWater) {
        water.style.display = "none";
        water.classList.remove("is-boiling");
        return;
    }

    water.style.display = "block";
    water.classList.toggle("is-boiling", isBoiling);
    if (hasSoup) {
        water.classList.add("has-soup");
    } else {
        water.classList.remove("has-soup");
    }
}
