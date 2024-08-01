import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaplayCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./Sprites.png", {
  sliceX: 62,
  sliceY: 32,
  anims: {
    "idle-down": 620,
    "walk-down": { from: 620, to: 621, loop: true, speed: 4 },
    "idle-side": 624,
    "walk-side": { from: 624, to: 625, loop: true, speed: 4 },
    "idle-up": 622,
    "walk-up": { from: 622, to: 623, loop: true, speed: 4 },
    "idle-right": 627,
    "idle-down-npc": 1182,
    "walk-down-npc": { from: 1182, to: 1183, loop: true, speed: 4 },
    "walk-up-npc": { from: 1183, to: 1184, loop: true, speed: 4 },
  },
});

k.loadSprite("preloge", "/preloge.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("preloge", async () => {
  const mapData = await (await fetch("./preloge.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("preloge"), k.pos(0, 0), k.scale(scaleFactor)]);

  const player = k.add([
    k.sprite("spritesheet", { anim: "idle-right" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(357.99, 114),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  const start = k.vec2(240, 336);
  const end = k.vec2(290, 140);

  const npc = k.add([
    k.sprite("spritesheet", { anim: "idle-down-npc" }),
    k.anchor("center"),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.pos(start),
    k.scale(scaleFactor),
    {
      speed: 100,
      target: end,
      moveSpeed: 100,
    },
    "npc",
  ]);

  // Function to start walking animation if not already playing
  function playWalkAnimation(direction, flipX = false) {
    if (currentDirection !== direction) {
      currentDirection = direction;
      npc.flipX = flipX;
      npc.play(direction);
    }
  }

  function moveNPC(npc) {
    // Berechnung der Richtung
    const direction = k.vec2(
      npc.target.x - npc.pos.x,
      npc.target.y - npc.pos.y,
      console.log(npc.target.x, npc.target.y, npc.pos.x, npc.pos.y)
    );
    const length = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );

    // Normalisierung der Richtung
    if (length > 0) {
      direction.x /= length;
      direction.y /= length;
    }

    // Berechnung der Distanz
    const distance = npc.pos.dist(npc.target);

    if (distance < 5) {
      // NPC hat das Ziel erreicht
      npc.play("idle-down-npc");
      return;
    }

    // Bewege den NPC in Richtung des Ziels
    npc.move(direction.x * npc.moveSpeed, direction.y * npc.moveSpeed);

    // Bestimme die Bewegungsrichtung und spiele die entsprechende Animation ab
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      // Bewegung horizontal
      npc.play("walk-side");
      npc.flipX = direction.x < 0;
    } else {
      // Bewegung vertikal
      npc.play("walk-up-npc");
    }
    npcDialogue(npc, player);
  }

  for (const layer of layers) {
    if (layer.name === "boundaries" || layer.name === "props") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
          console.log(boundary.name),
        ]);

        let isDialogueOpen = false;

        function closeDialogue() {
          const dialogueUI = document.getElementById("textbox-container");
          const dialogue = document.getElementById("dialogue");
          const canvas = document.getElementById("game");

          player.isInDialogue = false;
          isDialogueOpen = false;
          dialogueUI.style.display = "none";
          dialogue.innerHTML = "";
          console.log("Dialogue closed.");

          canvas.focus();
        }

        k.onKeyPress("e", () => {
          if (isDialogueOpen) {
            // If dialogue is open, close it
            closeDialogue();
          } else if (player.isInDialogue && player.currentBoundary) {
            // If the player is in dialogue range and dialogue is not open, open it
            displayDialogue(dialogueData[player.currentBoundary.name], () => {
              closeDialogue();
              console.log("Dialogue ended.");
            });
            isDialogueOpen = true;
            console.log("Dialogue opened.");
          } else {
            console.log("No dialogue to display.");
          }
        });

        player.onCollide("book", () => {
          console.log(boundary);
          if (boundary.name) {
            player.isInDialogue = true;
            player.currentBoundary = boundary;
            console.log(player.currentBoundary); // Store the current boundary
          }
        });
      }
      continue;
    }
    console.log(player.pos);

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );

          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100);
  });

  // k.onMouseDown((mouseBtn) => {
  //   if (mouseBtn !== "left" || player.isInDialogue) return;

  //   const worldMousePos = k.toWorld(k.mousePos());
  //   player.moveTo(worldMousePos, player.speed);

  //   const mouseAngle = player.pos.angle(worldMousePos);

  //   const lowerBound = 50;
  //   const upperBound = 125;

  //   if (
  //     mouseAngle > lowerBound &&
  //     mouseAngle < upperBound &&
  //     player.curAnim() !== "walk-up"
  //   ) {
  //     player.play("walk-up");
  //     player.direction = "up";
  //     return;
  //   }

  //   if (
  //     mouseAngle > -upperBound &&
  //     mouseAngle < -lowerBound &&
  //     player.curAnim() !== "walk-down"
  //   ) {
  //     player.play("walk-down");
  //     player.direction = "down";
  //     return;
  //   }

  //   if (Math.abs(mouseAngle) < lowerBound) {
  //     player.flipX = true;
  //     if (player.curAnim() !== "walk-side") {
  //       player.play("walk-side");
  //       player.direction = "left";
  //     }
  //   }

  //   if (Math.abs(mouseAngle) > upperBound) {
  //     player.flipX = false;
  //     if (player.curAnim() !== "walk-side") {
  //       player.play("walk-side");
  //       player.direction = "right";
  //     }
  //   }
  // });

  // k.onMouseRelease(() => {
  //   if (player.direction === "down") {
  //     player.play("idle-down");
  //     return;
  //   }

  //   if (player.direction === "up") {
  //     player.play("idle-up");
  //     return;
  //   }

  //   player.play("idle-side");
  // });

  // Variable to store the current direction
  let currentDirection = null;

  // Function to start walking animation if not already playing
  function playWalkAnimation(direction, flipX = false) {
    if (currentDirection !== direction) {
      currentDirection = direction;
      player.flipX = flipX;
      player.play(direction);
    }
  }

  // Function to stop walking animation
  function stopWalkAnimation() {
    currentDirection = null;
    player.stop();
  }

  k.onKeyDown("w", () => {
    player.move(0, -100);
    playWalkAnimation("walk-up");
  });

  k.onKeyDown("s", () => {
    player.move(0, 100);
    playWalkAnimation("walk-down");
  });

  k.onKeyDown("a", () => {
    player.move(-100, 0);
    playWalkAnimation("walk-side", true);
  });

  k.onKeyDown("d", () => {
    player.move(100, 0);
    playWalkAnimation("walk-side", false);
  });

  // Stop the animation when the key is released
  k.onKeyRelease(() => {
    stopWalkAnimation();
  });

  function StartDialogue() {
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");
    const canvas = document.getElementById("game");
    const closeBtn = document.getElementById("close");
    dialogueUI.style.display = "block";
    dialogue.innerText = dialogueData.StartDialoge;
    player.isInDialogue = true;

    closeBtn.addEventListener("click", () => {
      player.isInDialogue = false;
      dialogueUI.style.display = "none";
      dialogue.innerHTML = "";
      canvas.focus();
      k.onUpdate(() => {
        moveNPC(npc);
      });
    });
  }

  StartDialogue();

  k.onUpdate(() => {
    // Andere Updates hier (z.B. Kamera)
    k.camPos(player.pos.x, player.pos.y + 100);
  });
});

function npcDialogue(npc, player) {
  if (npc.pos.x >= 287 && npc.pos.y >= npc.target.y) {
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");
    const canvas = document.getElementById("game");
    const closeBtn = document.getElementById("close");
    dialogueUI.style.display = "block";
    dialogue.innerText = dialogueData.NPCDialogue;
    player.isInDialogue = true;

    closeBtn.addEventListener("click", () => {
      player.isInDialogue = false;
      dialogueUI.style.display = "none";
      dialogue.innerHTML = "";
      canvas.focus();
    });
  }
}

k.go("preloge");
