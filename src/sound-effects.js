export const EFFECTS={
  "click": {
    "level": 1,
    "attack": 0.035,
    "release": 0.2,
    "duration": 0.085,
    "file": "01-click"
  },
  "slash": {
    "level": 0.8,
    "attack": 0.035,
    "release": 0.2,
    "duration": 0.3,
    "file": "02-slash"
  },
  "wave": {
    "level": 0.8,
    "attack": 0.035,
    "release": 0.2,
    "duration": 0.55,
    "file": "03-wave"
  },
  "spark": {
    "level": 0.8,
    "attack": 0.035,
    "release": 0.2,
    "duration": 0.36,
    "file": "04-spark"
  },
  "star": {
    "level": 0.8,
    "attack": 0.035,
    "release": 0.2,
    "duration": 0.5,
    "file": "05-star"
  },
  "hit": {
    "level": 0.8,
    "attack": 0.035,
    "release": 0.2,
    "duration": 0.23,
    "file": "06-hit"
  },
  "hurt": {
    "level": 0.8,
    "attack": 0.035,
    "release": 0.2,
    "duration": 0.32,
    "file": "07-hurt"
  },
  "block": {
    "level": 0.8,
    "attack": 0.035,
    "release": 0.2,
    "duration": 0.4,
    "file": "08-block"
  },
  "hp-up": {
    "level": 0.62,
    "attack": 0.035,
    "release": 0.35,
    "duration": 0.8,
    "file": "09-hp-up"
  },
  "attack-up": {
    "level": 0.62,
    "attack": 0.035,
    "release": 0.35,
    "duration": 0.65,
    "file": "10-attack-up"
  },
  "shield-up": {
    "level": 0.62,
    "attack": 0.035,
    "release": 0.35,
    "duration": 0.8,
    "file": "11-shield-up"
  },
  "boss-clear": {
    "level": 0.22,
    "attack": 0.035,
    "release": 1.1,
    "duration": 3.4,
    "file": "12-boss-clear"
  }
};
// Overlapping effects use the strongest attenuation, never compounded.
export function levelAt(time,events,policies){let level=1;for(const {at,key} of events){const p=policies[key],elapsed=time-at;if(elapsed<0)continue;let value=1;if(elapsed<p.attack)value=1-(1-p.level)*elapsed/p.attack;else if(elapsed<p.duration)value=p.level;else if(elapsed<p.duration+p.release)value=p.level+(1-p.level)*(elapsed-p.duration)/p.release;level=Math.min(level,value);}return level;}
export function curve(events,policies,duration,rate=1000){return Float32Array.from({length:Math.round(duration*rate)+1},(_,i)=>levelAt(i/rate,events,policies));}

export function rewardSound(effect){return effect==='attack'?'attack-up':['shield','shards','charge','repair'].includes(effect)?'shield-up':'hp-up';}
