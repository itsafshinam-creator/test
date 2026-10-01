import * as THREE from 'three';
import { NPCData, DialogueNode } from '../types/game';

export const GAME_NPCS: NPCData[] = [
  {
    id: 'npc_merchant_darius',
    name: 'Merchant Darius',
    nameFa: 'بازرگان داریوش',
    role: 'merchant',
    x: -6,
    y: 0,
    z: 4,
    portrait: '/src/assets/images/merchant_portrait_1790880140762.jpg',
    dialogueId: 'darius_intro',
  },
  {
    id: 'npc_master_elion',
    name: 'Master Elion',
    nameFa: 'استاد الیون',
    role: 'mentor',
    x: 10,
    y: 0,
    z: -8,
    dialogueId: 'elion_intro',
  },
  {
    id: 'npc_informant_sira',
    name: 'Informant Sira',
    nameFa: 'سیرا رابط مخفی',
    role: 'informant',
    x: -12,
    y: 0,
    z: -14,
    dialogueId: 'sira_intro',
  },
];

export const DIALOGUE_NODES: Record<string, DialogueNode> = {
  darius_intro: {
    id: 'darius_intro',
    speaker: 'Merchant Darius',
    speakerFa: 'بازرگان داریوش',
    text: 'Ah, traveller of the shadows! You arrive at a dire hour. The Citadel Sentinels raided my caravan and locked away the Ancient Aether Relic inside their fortified vault. Can you retrieve it?',
    textFa: 'درود ای مسافر سایه‌ها! در ساعتی حساس رسیده‌ای. نگهبانان قلعه کاروان مرا غارت کردند و عتیقه اثیر را درون خزانه‌شان قفل کردند. آیا می‌توانی آن را بازگردانی؟',
    portrait: '/src/assets/images/merchant_portrait_1790880140762.jpg',
    options: [
      {
        text: 'I will infiltrate the Citadel and recover the Relic. [Accept Quest]',
        textFa: 'من به قلعه نفوذ خواهم کرد و عتیقه را برمی‌گردانم. [قبول مأموریت]',
        action: 'accept_quest',
        questId: 'mission_missing_relic',
        nextDialogueId: 'darius_quest_accepted',
      },
      {
        text: 'Show me what wares you have for sale. [Open Shop]',
        textFa: 'کالاهایت را به من نشان بده. [باز کردن فروشگاه]',
        action: 'open_shop',
      },
      {
        text: 'I have retrieved the Ancient Aether Relic! [Claim Reward]',
        textFa: 'من عتیقه باستانی اثیر را بازیابی کردم! [دریافت پاداش]',
        action: 'claim_reward',
        questId: 'mission_missing_relic',
        nextDialogueId: 'darius_quest_complete',
      },
      {
        text: 'I must prepare first.',
        textFa: 'ابتدا باید آماده شوم.',
        action: 'close',
      },
    ],
  },
  darius_quest_accepted: {
    id: 'darius_quest_accepted',
    speaker: 'Merchant Darius',
    speakerFa: 'بازرگان داریوش',
    text: 'May the wind mask your footsteps. Watch out for the rooftop archers and sneak through the shadow alcoves in the courtyard!',
    textFa: 'باشد که باد صدای گام‌هایت را بپوشاند. مراقب کمانداران روی پشت‌بام باش و از سایه‌ها عبور کن!',
    portrait: '/src/assets/images/merchant_portrait_1790880140762.jpg',
    options: [
      { text: 'I am on my way.', textFa: 'در راهم.', action: 'close' },
    ],
  },
  darius_quest_complete: {
    id: 'darius_quest_complete',
    speaker: 'Merchant Darius',
    speakerFa: 'بازرگان داریوش',
    text: 'By the gods! You truly recovered it! Take this bounty in Gold and AETH tokens, as well as the Shadow Mantle.',
    textFa: 'به نام یزدان! واقعاً موفق شدی! این پاداش سکه و توکن اثیر و این ردای سایه را بپذیر.',
    portrait: '/src/assets/images/merchant_portrait_1790880140762.jpg',
    options: [
      { text: 'A pleasure doing business with you.', textFa: 'خوشحالم که معامله کردیم.', action: 'close' },
    ],
  },
  elion_intro: {
    id: 'elion_intro',
    speaker: 'Master Elion',
    speakerFa: 'استاد الیون',
    text: 'A true shadow strikes without sound and leaves without trace. Are you ready to prove your parkour mastery on the High Spire?',
    textFa: 'یک سایه واقعی بی‌صدا ضربه می‌زند و بی‌ردپا می‌رود. آیا آماده‌ای استادی پارکور خود را بر مناره بلند اثبات کنی؟',
    options: [
      {
        text: 'Teach me the rooftop way. [Accept Quest]',
        textFa: 'راه پشت‌بام‌ها را به من بیاموز. [قبول مأموریت]',
        action: 'accept_quest',
        questId: 'mission_rooftop_shadows',
        nextDialogueId: 'elion_quest_accepted',
      },
      {
        text: 'How do I remain undetected?',
        textFa: 'چگونه از دید مخفی بمانم؟',
        nextDialogueId: 'elion_stealth_tip',
      },
      { text: 'I will return later.', textFa: 'بعداً بازمی‌گردم.', action: 'close' },
    ],
  },
  elion_stealth_tip: {
    id: 'elion_stealth_tip',
    speaker: 'Master Elion',
    speakerFa: 'استاد الیون',
    text: 'Crouch [C] to dampen footstep noise and halve enemy sight range. Hide inside straw carts or dark archways to become completely invisible to patrols!',
    textFa: 'بنشین تا صدای گام‌هایت کم شود و فاصله دید دشمنان به نصف برسد. در ارابه‌های کاه یا طاق‌های تاریک پنهان شو تا کاملاً نامرئی شوی!',
    options: [
      { text: 'Understood, Master.', textFa: 'متوجه شدم، استاد.', action: 'close' },
    ],
  },
  elion_quest_accepted: {
    id: 'elion_quest_accepted',
    speaker: 'Master Elion',
    speakerFa: 'استاد الیون',
    text: 'Scale the ledges at the market corner, cross the timber bridge, and seize the intercepted courier dispatch atop the Spire.',
    textFa: 'از لبه‌های گوشه بازار بالا برو، از پل چوبی بگذر و طومار پیام‌رسان را از فراز مناره بردار.',
    options: [
      { text: 'It will be done.', textFa: 'انجام خواهد شد.', action: 'close' },
    ],
  },
  sira_intro: {
    id: 'sira_intro',
    speaker: 'Informant Sira',
    speakerFa: 'سیرا رابط مخفی',
    text: 'Keep your voice low. The guards are on high alert. If you are sneaking into the Citadel, there is an underground sewer grate near the western wall that bypasses the iron gate.',
    textFa: 'صدایت را پایین بیاور. نگهبانان در آماده‌باش هستند. اگر به قلعه می‌روی، یک مجرای زیرزمینی نزدیک دیوار غربی هست که دروازه آهنی را دور می‌زند.',
    options: [
      { text: 'Thank you for the intelligence.', textFa: 'ممنون بابت این اطلاعات.', action: 'close' },
    ],
  },
};

export class NPCInstance {
  public data: NPCData;
  public group: THREE.Group;
  private promptMesh: THREE.Sprite;

  constructor(data: NPCData) {
    this.data = data;
    this.group = new THREE.Group();
    this.group.position.set(data.x, data.y, data.z);

    // 3D Stylized Robed NPC Model
    const robeMat = new THREE.MeshStandardMaterial({
      color: data.role === 'merchant' ? 0xd97706 : data.role === 'mentor' ? 0x0284c7 : 0x475569,
      roughness: 0.7,
    });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf5d0b0, roughness: 0.8 });

    // Robe Torso
    const torsoGeo = new THREE.CylinderGeometry(0.3, 0.45, 1.4, 8);
    const torso = new THREE.Mesh(torsoGeo, robeMat);
    torso.position.y = 0.7;
    torso.castShadow = true;
    this.group.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.55;
    this.group.add(head);

    // Turban / Hood
    const turbanGeo = new THREE.TorusGeometry(0.22, 0.08, 6, 12);
    const turban = new THREE.Mesh(turbanGeo, robeMat);
    turban.position.y = 1.62;
    turban.rotation.x = Math.PI / 2;
    this.group.add(turban);

    // Overhead Interaction Indicator ("E / Talk")
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.roundRect(4, 4, 120, 40, 8);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TALK', 64, 24);
    }
    const spriteMap = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, transparent: true });
    this.promptMesh = new THREE.Sprite(spriteMat);
    this.promptMesh.position.set(0, 2.2, 0);
    this.promptMesh.scale.set(1.2, 0.45, 1);
    this.group.add(this.promptMesh);
  }

  public update(playerPos: THREE.Vector3) {
    const dist = this.group.position.distanceTo(playerPos);
    this.promptMesh.visible = dist <= 4.0;

    // Face player if nearby
    if (dist <= 6.0) {
      const toPlayer = new THREE.Vector3().subVectors(playerPos, this.group.position);
      toPlayer.y = 0;
      const yaw = Math.atan2(toPlayer.x, toPlayer.z);
      this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, yaw, 0.05);
    }
  }
}
