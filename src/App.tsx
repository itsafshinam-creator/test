/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GameEngine, InteractionTarget } from './game/GameEngine';
import { saveManager } from './save/SaveManager';
import { telegram } from './telegram/TelegramManager';
import { tokenService } from './web3/token';
import { nftService } from './web3/nft';
import { audio } from './audio/AudioManager';
import { DIALOGUE_NODES } from './game/NPCManager';
import { ShopItem } from './ui/ShopModal';

// UI Components
import { HUD } from './ui/HUD';
import { MobileControls } from './ui/MobileControls';
import { MainMenuModal } from './ui/MainMenuModal';
import { InventoryModal } from './ui/InventoryModal';
import { CharacterModal } from './ui/CharacterModal';
import { ShopModal } from './ui/ShopModal';
import { WalletModal } from './ui/WalletModal';
import { MissionsModal } from './ui/MissionsModal';
import { SettingsModal } from './ui/SettingsModal';
import { TutorialModal } from './ui/TutorialModal';
import { FullMapModal } from './ui/FullMapModal';
import { DialogueModal } from './ui/DialogueModal';
import { DeathModal } from './ui/DeathModal';
import { GlobalErrorBoundary } from './ui/GlobalErrorBoundary';
import {
  GameSettings,
  PlayerStats,
  InventoryItem,
  Mission,
  DialogueNode,
  DialogueOption,
} from './types/game';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Saved Data States
  const [saveData, setSaveData] = useState(() => saveManager.getData());
  const [settings, setSettings] = useState<GameSettings>(saveData.settings);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(saveData.playerStats);
  const [inventory, setInventory] = useState<InventoryItem[]>(saveData.inventory);
  const [missions, setMissions] = useState<Mission[]>(saveData.missions);
  const [gold, setGold] = useState(saveData.currencies.gold);
  const [aeth, setAeth] = useState(saveData.currencies.aeth);

  // Runtime Game States
  const [currentHp, setCurrentHp] = useState(playerStats.hp);
  const [currentStamina, setCurrentStamina] = useState(playerStats.stamina);
  const [stealthVisibility, setStealthVisibility] = useState(0.5);
  const [isHiddenInShadow, setIsHiddenInShadow] = useState(false);
  const [interactionTarget, setInteractionTarget] = useState<InteractionTarget | null>(null);
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0.5, 12]);
  const [isDead, setIsDead] = useState(false);

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    | 'none'
    | 'menu'
    | 'inventory'
    | 'character'
    | 'shop'
    | 'wallet'
    | 'missions'
    | 'settings'
    | 'tutorial'
    | 'map'
    | 'dialogue'
  >('none');
  const [currentDialogue, setCurrentDialogue] = useState<DialogueNode | null>(null);

  // Input Keys Tracking for Desktop
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const isMouseDown = useRef(false);

  // Currently Tracked Active Mission
  const activeMission = missions.find((m) => m.status === 'active') || missions[0] || null;

  // Initialize Audio Volumes
  useEffect(() => {
    audio.setVolumes(settings.sfxVolume, settings.musicVolume);
  }, [settings.sfxVolume, settings.musicVolume]);

  // Handle Objective Progress
  const handleObjectiveProgress = useCallback((eventType: string, eventId?: string) => {
    setMissions((prevMissions) => {
      let updated = false;
      const newMissions = prevMissions.map((mission) => {
        if (mission.status !== 'active') return mission;

        const newObjectives = mission.objectives.map((obj) => {
          if (obj.completed) return obj;

          if (mission.id === 'mission_missing_relic') {
            if (obj.id === 'obj_talk_merchant' && eventType === 'talk_merchant') {
              updated = true;
              return { ...obj, current: 1, completed: true };
            }
            if (obj.id === 'obj_infiltrate_citadel' && eventType === 'infiltrate_citadel') {
              updated = true;
              return { ...obj, current: 1, completed: true };
            }
            if (obj.id === 'obj_retrieve_relic' && eventType === 'collect_item' && eventId === 'col_citadel_relic') {
              updated = true;
              return { ...obj, current: 1, completed: true };
            }
            if (obj.id === 'obj_return_darius' && eventType === 'return_darius') {
              updated = true;
              return { ...obj, current: 1, completed: true };
            }
          }

          if (mission.id === 'mission_rooftop_shadows') {
            if (obj.id === 'obj_climb_spire' && eventType === 'climb_spire') {
              updated = true;
              return { ...obj, current: 1, completed: true };
            }
            if (obj.id === 'obj_retrieve_scroll' && eventType === 'collect_item' && eventId === 'col_spire_scroll') {
              updated = true;
              return { ...obj, current: 1, completed: true };
            }
            if (obj.id === 'obj_escape_undetected' && eventType === 'escape_undetected') {
              updated = true;
              return { ...obj, current: 1, completed: true };
            }
          }

          return obj;
        });

        // Check if all objectives complete
        const allDone = newObjectives.every((o) => o.completed);
        if (allDone && mission.status === 'active') {
          audio.playQuestComplete();
          telegram.triggerNotificationHaptic('success');
          // Grant rewards
          setGold((g) => g + mission.reward.gold);
          setAeth((a) => a + mission.reward.aeth);
          tokenService.claimReward(mission.reward.aeth);
          nftService.unlockBadge('badge_relic_hunter');
          return { ...mission, objectives: newObjectives, status: 'completed' as const };
        }

        return { ...mission, objectives: newObjectives };
      });

      if (updated) {
        saveManager.save({ missions: newMissions });
      }
      return newMissions;
    });
  }, []);

  // Initialize Game Engine on Canvas Mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, saveData, settings);
    engineRef.current = engine;

    // Connect Callbacks
    engine.onHealthChange = (hp, maxHp) => {
      setCurrentHp(hp);
      setPlayerStats((prev) => ({ ...prev, hp, maxHp }));
    };

    engine.onStaminaChange = (stamina, maxStamina) => {
      setCurrentStamina(stamina);
      setPlayerStats((prev) => ({ ...prev, stamina, maxStamina }));
    };

    engine.onStealthChange = (visibility, isHidden) => {
      setStealthVisibility(visibility);
      setIsHiddenInShadow(isHidden);
    };

    engine.onInteractionPrompt = (target) => {
      setInteractionTarget(target);
    };

    engine.onPlayerDeath = () => {
      setIsDead(true);
      engine.pause();
    };

    engine.onObjectiveProgress = (type, id) => {
      handleObjectiveProgress(type, id);
    };

    // Resize Handler
    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    // Save Position Periodically
    const posInterval = window.setInterval(() => {
      if (engine.player) {
        const p = engine.player.group.position;
        setPlayerPos([p.x, p.y, p.z]);

        // Check Citadel Infiltration area triggers
        if (p.z < -18 && p.z > -36) {
          handleObjectiveProgress('infiltrate_citadel');
        }
        // Check Spire Climb altitude trigger
        if (p.y > 9.5 && p.x > 7 && p.x < 13 && p.z > -11 && p.z < -5) {
          handleObjectiveProgress('climb_spire');
        }
      }
    }, 1500);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(posInterval);
      engine.destroy();
    };
  }, []);

  // Update Engine Quality on Setting Change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setQuality(settings.graphicsQuality);
    }
  }, [settings.graphicsQuality]);

  // --- DESKTOP KEYBOARD & MOUSE CONTROLS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== 'none' || isDead) return;

      keysPressed.current[e.code] = true;

      if (e.code === 'KeyC') {
        engineRef.current?.handleCrouchToggle();
      } else if (e.code === 'Space') {
        e.preventDefault();
        engineRef.current?.handleJump();
      } else if (e.code === 'KeyE') {
        handleTriggerInteract();
      } else if (e.code === 'Escape') {
        setActiveModal((prev) => (prev === 'none' ? 'menu' : 'none'));
      }

      updateMovement();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      updateMovement();
    };

    const updateMovement = () => {
      if (!engineRef.current) return;
      const k = keysPressed.current;

      let x = 0;
      let y = 0;
      if (k['KeyW'] || k['ArrowUp']) y -= 1;
      if (k['KeyS'] || k['ArrowDown']) y += 1;
      if (k['KeyA'] || k['ArrowLeft']) x -= 1;
      if (k['KeyD'] || k['ArrowRight']) x += 1;

      const vec = new THREE.Vector2(x, y);
      if (vec.lengthSq() > 0) vec.normalize();
      engineRef.current.inputDir.copy(vec);
      engineRef.current.isSprinting = !!k['ShiftLeft'] || !!k['ShiftRight'];
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (activeModal !== 'none' || isDead) return;
      if (e.button === 0) {
        // Left Click -> Attack
        engineRef.current?.handleAttack(false);
      } else if (e.button === 2) {
        // Right Click -> Heavy / Block
        e.preventDefault();
        engineRef.current?.handleAttack(true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (activeModal !== 'none' || isDead) return;
      // Drag mouse to orbit camera on PC
      if (e.buttons === 1 || e.buttons === 2) {
        engineRef.current?.rotateCamera(e.movementX, e.movementY, settings.cameraSensitivity);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [activeModal, isDead, settings.cameraSensitivity]);

  // Handle Interaction Trigger (E / Button)
  const handleTriggerInteract = () => {
    if (!engineRef.current) return;

    if (interactionTarget?.type === 'npc') {
      const npcData = DIALOGUE_NODES[interactionTarget.id.replace('npc_', '') + '_intro'] || DIALOGUE_NODES.darius_intro;
      setCurrentDialogue(npcData);
      setActiveModal('dialogue');
      audio.playUI();
      if (interactionTarget.id.includes('darius')) {
        handleObjectiveProgress('talk_merchant');
      }
    } else {
      const handled = engineRef.current.handleInteract();
      if (handled && interactionTarget?.type === 'collectible') {
        setGold((g) => g + 40);
        saveManager.save({ currencies: { gold: gold + 40, aeth } });
      }
    }
  };

  // Dialogue Selection Handler
  const handleSelectDialogueOption = (option: DialogueOption) => {
    audio.playUI();
    if (option.action === 'open_shop') {
      setActiveModal('shop');
    } else if (option.action === 'accept_quest' && option.questId) {
      setMissions((prev) =>
        prev.map((m) => (m.id === option.questId ? { ...m, status: 'active' } : m))
      );
      if (option.questId === 'mission_missing_relic') {
        handleObjectiveProgress('talk_merchant');
      }
      telegram.triggerNotificationHaptic('success');
      if (option.nextDialogueId && DIALOGUE_NODES[option.nextDialogueId]) {
        setCurrentDialogue(DIALOGUE_NODES[option.nextDialogueId]);
      } else {
        setActiveModal('none');
      }
    } else if (option.action === 'claim_reward' && option.questId) {
      handleObjectiveProgress('return_darius');
      if (option.nextDialogueId && DIALOGUE_NODES[option.nextDialogueId]) {
        setCurrentDialogue(DIALOGUE_NODES[option.nextDialogueId]);
      } else {
        setActiveModal('none');
      }
    } else if (option.action === 'close') {
      setActiveModal('none');
      setCurrentDialogue(null);
    } else if (option.nextDialogueId && DIALOGUE_NODES[option.nextDialogueId]) {
      setCurrentDialogue(DIALOGUE_NODES[option.nextDialogueId]);
    }
  };

  // Inventory Item Use
  const handleUseItem = (item: InventoryItem) => {
    if (item.effect?.type === 'heal') {
      engineRef.current?.player.heal(item.effect.amount);
      setCurrentHp((h) => Math.min(playerStats.maxHp, h + item.effect!.amount));
    }

    setInventory((prev) =>
      prev
        .map((it) => (it.id === item.id ? { ...it, quantity: it.quantity - 1 } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  // Inventory Item Equip
  const handleEquipItem = (item: InventoryItem) => {
    setInventory((prev) =>
      prev.map((it) =>
        it.category === item.category ? { ...it, equipped: it.id === item.id } : it
      )
    );
  };

  // Stat Upgrades
  const handleUpgradeStat = (statKey: keyof PlayerStats) => {
    setPlayerStats((prev) => {
      const updated = { ...prev };
      if (updated.unspentAttributePoints > 0) {
        updated.unspentAttributePoints -= 1;
        if (statKey === 'maxHp') updated.maxHp += 15;
        else if (statKey === 'maxStamina') updated.maxStamina += 15;
        else if (statKey === 'damage') updated.damage += 4;
        else if (statKey === 'movementSpeed') updated.movementSpeed += 0.4;

        if (engineRef.current) {
          engineRef.current.player.stats = updated;
        }
        saveManager.save({ playerStats: updated });
      }
      return updated;
    });
  };

  // Shop Purchase
  const handleBuyItem = (shopItem: ShopItem, currency: 'gold' | 'aeth'): boolean => {
    if (currency === 'gold') {
      if (gold < shopItem.goldCost) return false;
      const newGold = gold - shopItem.goldCost;
      setGold(newGold);

      // Add to inventory
      setInventory((prev) => {
        const existing = prev.find((i) => i.name === shopItem.name);
        if (existing) {
          return prev.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [
          ...prev,
          {
            id: `item_${Date.now()}`,
            name: shopItem.name,
            nameFa: shopItem.nameFa,
            description: shopItem.description,
            descriptionFa: shopItem.descriptionFa,
            category: shopItem.category,
            rarity: shopItem.rarity,
            value: Math.round(shopItem.goldCost * 0.7),
            quantity: 1,
            effect: shopItem.effect,
          },
        ];
      });

      saveManager.save({ currencies: { gold: newGold, aeth } });
      return true;
    } else {
      if (!shopItem.aethCost || aeth < shopItem.aethCost) return false;
      const newAeth = aeth - shopItem.aethCost;
      setAeth(newAeth);
      tokenService.spendTokens(shopItem.aethCost);
      saveManager.save({ currencies: { gold, aeth: newAeth } });
      return true;
    }
  };

  // Fast Travel Handler
  const handleFastTravel = (pos: [number, number, number]) => {
    if (engineRef.current?.player) {
      engineRef.current.player.group.position.set(pos[0], pos[1], pos[2]);
      setPlayerPos(pos);
    }
  };

  // Respawn after death
  const handleRespawn = () => {
    setIsDead(false);
    if (engineRef.current) {
      engineRef.current.player.group.position.set(0, 0.5, 12); // Back to Grand Bazaar
      engineRef.current.player.stats.hp = engineRef.current.player.stats.maxHp;
      engineRef.current.player.stats.stamina = engineRef.current.player.stats.maxStamina;
      setCurrentHp(engineRef.current.player.stats.maxHp);
      setCurrentStamina(engineRef.current.player.stats.maxStamina);
      engineRef.current.resume();
    }
  };

  return (
    <GlobalErrorBoundary>
      <main className="relative w-screen h-screen overflow-hidden bg-[#0b0d11]">
        {/* 3D WebGL Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block touch-none" />

        {/* In-Game Heads-Up Display (HUD) */}
        <HUD
          hp={currentHp}
          maxHp={playerStats.maxHp}
          stamina={currentStamina}
          maxStamina={playerStats.maxStamina}
          stealthVisibility={stealthVisibility}
          isHiddenInShadow={isHiddenInShadow}
          gold={gold}
          aeth={aeth}
          activeMission={activeMission}
          interactionTarget={interactionTarget}
          language={settings.language}
          onOpenMenu={() => setActiveModal('menu')}
          onOpenInventory={() => setActiveModal('inventory')}
          onOpenCharacter={() => setActiveModal('character')}
          onOpenMap={() => setActiveModal('map')}
          onOpenWallet={() => setActiveModal('wallet')}
          onOpenTutorial={() => setActiveModal('tutorial')}
          onTriggerInteract={handleTriggerInteract}
        />

        {/* Mobile Virtual Joystick & Touch Action Controls */}
        <MobileControls
          onMoveChange={(dir) => {
            if (engineRef.current) {
              engineRef.current.inputDir.copy(dir);
            }
          }}
          onCameraRotate={(dx, dy) => {
            if (engineRef.current) {
              engineRef.current.rotateCamera(dx, dy, settings.cameraSensitivity);
            }
          }}
          onAttack={() => engineRef.current?.handleAttack(false)}
          onHeavyAttack={() => engineRef.current?.handleAttack(true)}
          onDodge={() => engineRef.current?.handleDodge()}
          onJump={() => engineRef.current?.handleJump()}
          onStealthToggle={() => engineRef.current?.handleCrouchToggle()}
          onInteract={handleTriggerInteract}
          isCrouched={engineRef.current?.player.isCrouched ?? false}
        />

        {/* Modals & Overlays */}
        <MainMenuModal
          isOpen={activeModal === 'menu'}
          onClose={() => setActiveModal('none')}
          language={settings.language}
          user={telegram.user}
          onOpenMissions={() => setActiveModal('missions')}
          onOpenInventory={() => setActiveModal('inventory')}
          onOpenCharacter={() => setActiveModal('character')}
          onOpenShop={() => setActiveModal('shop')}
          onOpenWallet={() => setActiveModal('wallet')}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenTutorial={() => setActiveModal('tutorial')}
        />

        <InventoryModal
          isOpen={activeModal === 'inventory'}
          onClose={() => setActiveModal('none')}
          inventory={inventory}
          language={settings.language}
          onUseItem={handleUseItem}
          onEquipItem={handleEquipItem}
        />

        <CharacterModal
          isOpen={activeModal === 'character'}
          onClose={() => setActiveModal('none')}
          stats={playerStats}
          language={settings.language}
          onUpgradeStat={handleUpgradeStat}
        />

        <ShopModal
          isOpen={activeModal === 'shop'}
          onClose={() => setActiveModal('none')}
          gold={gold}
          aeth={aeth}
          language={settings.language}
          onBuyItem={handleBuyItem}
        />

        <WalletModal
          isOpen={activeModal === 'wallet'}
          onClose={() => setActiveModal('none')}
          language={settings.language}
        />

        <MissionsModal
          isOpen={activeModal === 'missions'}
          onClose={() => setActiveModal('none')}
          missions={missions}
          language={settings.language}
          onTrackMission={() => setActiveModal('none')}
        />

        <SettingsModal
          isOpen={activeModal === 'settings'}
          onClose={() => setActiveModal('none')}
          settings={settings}
          onUpdateSettings={(newSettings) => {
            const merged = { ...settings, ...newSettings };
            setSettings(merged);
            saveManager.save({ settings: merged });
          }}
          onResetSave={() => {
            saveManager.resetProgress();
            window.location.reload();
          }}
        />

        <TutorialModal
          isOpen={activeModal === 'tutorial'}
          onClose={() => setActiveModal('none')}
          language={settings.language}
        />

        <FullMapModal
          isOpen={activeModal === 'map'}
          onClose={() => setActiveModal('none')}
          playerPos={playerPos}
          language={settings.language}
          onFastTravel={handleFastTravel}
        />

        {currentDialogue && (
          <DialogueModal
            dialogue={currentDialogue}
            language={settings.language}
            onSelectOption={handleSelectDialogueOption}
            onClose={() => setActiveModal('none')}
          />
        )}

        <DeathModal
          isOpen={isDead}
          language={settings.language}
          onRespawn={handleRespawn}
        />
      </main>
    </GlobalErrorBoundary>
  );
}
