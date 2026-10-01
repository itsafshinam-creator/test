import * as THREE from 'three';
import { audio } from '../audio/AudioManager';
import { telegram } from '../telegram/TelegramManager';

export interface FloatingText {
  id: string;
  text: string;
  pos: THREE.Vector3;
  color: string;
  opacity: number;
  lifetime: number;
}

export class CombatSystem {
  public isAttacking = false;
  public attackType: 'light' | 'heavy' = 'light';
  public comboStep = 0;
  private attackTimer = 0;
  private attackDuration = 0.35;
  private comboResetTimer = 0;

  public isBlocking = false;
  public isDodging = false;
  private dodgeTimer = 0;
  private dodgeDuration = 0.4;
  public dodgeDirection = new THREE.Vector3();

  public floatingTexts: FloatingText[] = [];

  public triggerLightAttack(staminaCost = 15, currentStamina = 100): boolean {
    if (this.isAttacking || this.isDodging || currentStamina < staminaCost) return false;

    this.isAttacking = true;
    this.attackType = 'light';
    this.attackDuration = 0.32;
    this.attackTimer = 0;
    this.comboStep = (this.comboStep % 3) + 1;
    this.comboResetTimer = 1.0;

    audio.playSlash(false);
    telegram.triggerHaptic('light');
    return true;
  }

  public triggerHeavyAttack(staminaCost = 30, currentStamina = 100): boolean {
    if (this.isAttacking || this.isDodging || currentStamina < staminaCost) return false;

    this.isAttacking = true;
    this.attackType = 'heavy';
    this.attackDuration = 0.55;
    this.attackTimer = 0;
    this.comboStep = 4;
    this.comboResetTimer = 1.2;

    audio.playSlash(true);
    telegram.triggerHaptic('medium');
    return true;
  }

  public triggerDodge(moveDir: THREE.Vector3, staminaCost = 20, currentStamina = 100): boolean {
    if (this.isDodging || this.isAttacking || currentStamina < staminaCost) return false;

    this.isDodging = true;
    this.dodgeTimer = 0;
    this.dodgeDuration = 0.38;

    if (moveDir.lengthSq() > 0.05) {
      this.dodgeDirection.copy(moveDir).normalize();
    } else {
      this.dodgeDirection.set(0, 0, -1); // Roll forward by default
    }

    audio.playSlash(false);
    telegram.triggerHaptic('light');
    return true;
  }

  public setBlocking(blocking: boolean) {
    this.isBlocking = blocking;
  }

  public addDamageText(pos: THREE.Vector3, amount: number | string, isCrit = false, isStealth = false) {
    let color = '#f87171'; // Red
    let text = typeof amount === 'number' ? `-${amount}` : amount;

    if (isCrit) {
      color = '#fbbf24'; // Gold
      text = `CRIT ${text}!`;
    } else if (isStealth) {
      color = '#38bdf8'; // Cyan
      text = `STEALTH TAKEDOWN`;
    }

    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      pos: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 1.8, (Math.random() - 0.5) * 0.4)),
      color,
      opacity: 1,
      lifetime: 1.2,
    });
  }

  public update(delta: number) {
    // Attack duration handling
    if (this.isAttacking) {
      this.attackTimer += delta;
      if (this.attackTimer >= this.attackDuration) {
        this.isAttacking = false;
      }
    }

    // Combo reset timer
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= delta;
      if (this.comboResetTimer <= 0) {
        this.comboStep = 0;
      }
    }

    // Dodge handling
    if (this.isDodging) {
      this.dodgeTimer += delta;
      if (this.dodgeTimer >= this.dodgeDuration) {
        this.isDodging = false;
      }
    }

    // Floating text update
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.pos.y += delta * 0.9;
      ft.lifetime -= delta;
      ft.opacity = Math.max(0, ft.lifetime / 1.2);
      if (ft.lifetime <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }
}
