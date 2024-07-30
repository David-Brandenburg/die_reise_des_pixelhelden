import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaplayCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./Sprites.png", {
  sliceX: 62,
  sliceY: 32,
  anims: {
    "idle-down": 628,
    "walk-down": { from: 628, to: 629, loop: true, speed: 4 },
    "idle-side": 632,
    "walk-side": { from: 632, to: 633, loop: true, speed: 4 },
    "idle-up": 630,
    "walk-up": { from: 630, to: 631, loop: true, speed: 4 },
    "idle-right": 635,
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
        ]);
        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(dialogueData[boundary.name], () => {
              player.isInDialogue = false;
            });
          });
        }
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

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle > -upperBound &&
      mouseAngle < -lowerBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") {
        player.play("walk-side");
        player.direction = "left";
      }
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") {
        player.play("walk-side");
        player.direction = "right";
      }
    }
  });

  k.onMouseRelease(() => {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }

    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  });
});

k.go("preloge");
