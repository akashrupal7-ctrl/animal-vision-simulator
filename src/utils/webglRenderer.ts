// WebGL GPU-Accelerated Real-Time Shader Engine for Animal Vision Simulator
// Enables locked 60 FPS performance on mid-range and low-end Android devices.

export const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 vTexCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Flip Y coordinate for WebGL texture mapping standard
    vTexCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

export const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D u_texture;
uniform sampler2D u_prevTexture;
uniform float u_time;
uniform vec2 u_resolution;

uniform int u_animalId;
uniform float u_intensity;
uniform float u_nightGain;
uniform float u_zoomLevel;
uniform float u_compoundScale;
uniform float u_motionSensitivity;

uniform mat3 u_colorMatrix;
uniform float u_hasColorMatrix;

uniform float u_comparisonActive;
uniform float u_comparisonSplit;

vec3 getThermalColor(float luma) {
    luma = clamp(luma, 0.0, 1.0);
    if (luma < 0.25) {
        return mix(vec3(0.0, 0.0, 0.35), vec3(0.0, 0.75, 0.95), luma / 0.25);
    } else if (luma < 0.5) {
        return mix(vec3(0.0, 0.75, 0.95), vec3(0.0, 0.95, 0.1), (luma - 0.25) / 0.25);
    } else if (luma < 0.75) {
        return mix(vec3(0.0, 0.95, 0.1), vec3(0.95, 0.75, 0.0), (luma - 0.5) / 0.25);
    } else if (luma < 0.9) {
        return mix(vec3(0.95, 0.75, 0.0), vec3(0.95, 0.1, 0.0), (luma - 0.75) / 0.15);
    } else {
        return mix(vec3(0.95, 0.1, 0.0), vec3(1.0, 1.0, 1.0), (luma - 0.9) / 0.1);
    }
}

float hexDistance(vec2 p) {
    p = abs(p);
    return max(p.x * 0.57735 + p.y * 0.5, p.y);
}

void main() {
    vec2 uv = vTexCoord;

    // Split Screen Comparison Handling directly in GLSL GPU
    if (u_comparisonActive > 0.5) {
        if (uv.x < u_comparisonSplit) {
            vec4 orig = texture2D(u_texture, uv);
            if (abs(uv.x - u_comparisonSplit) < 0.0025) {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            } else {
                gl_FragColor = orig;
            }
            return;
        }
    }

    vec2 sampledUv = uv;

    // Fovea Telephoto Zoom Effect (Eagle:3, Falcon:21, Hawk:55, Jumping Spider:85)
    if (u_animalId == 3 || u_animalId == 21 || u_animalId == 55 || u_animalId == 85) {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(uv, center);
        float radius = 0.22;
        if (dist < radius) {
            float zoom = max(1.0, u_zoomLevel * 1.5);
            sampledUv = center + (uv - center) / zoom;
        }
    }

    vec4 color = texture2D(u_texture, sampledUv);
    vec3 rgb = color.rgb;

    // Color Matrix Transformation (Dichromat/Trichromat/UV)
    if (u_hasColorMatrix > 0.5) {
        vec3 shifted = u_colorMatrix * rgb;
        rgb = mix(rgb, shifted, u_intensity);
    }

    // Animal Specific Optical Shaders (0 to 88)
    if (u_animalId == 0) {
        // Human: Standard trichromatic vision
    }
    else if (u_animalId == 1) {
        // Dog: Dichromat color matrix + night gain
        rgb = pow(rgb, vec3(0.95)) * (u_nightGain * 1.05);
    } 
    else if (u_animalId == 2) {
        // Cat: Night vision tapetum lucidum amplification & peripheral blur
        rgb *= (u_nightGain * 1.35);
        float dist = distance(uv, vec2(0.5));
        rgb *= smoothstep(0.75, 0.25, dist);
    } 
    else if (u_animalId == 3) {
        // Eagle: Contrast enhancement + central reticle ring
        rgb = clamp((rgb - 0.5) * 1.3 + 0.5, 0.0, 1.0);
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(uv, center);
        if (abs(dist - 0.22) < 0.0035) {
            rgb = vec3(0.92, 0.7, 0.0);
        } else if (dist < 0.22 && (abs(uv.x - 0.5) < 0.001 || abs(uv.y - 0.5) < 0.001) && dist > 0.03) {
            rgb = mix(rgb, vec3(0.92, 0.7, 0.0), 0.7);
        }
    } 
    else if (u_animalId == 4) {
        // Bee: Hexagonal ommatidia compound eye grid
        float hexSize = max(0.01, 0.05 - (u_compoundScale / 100.0) * 0.035);
        vec2 aspect = vec2(u_resolution.x / max(1.0, u_resolution.y), 1.0);
        vec2 st = uv * aspect / hexSize;
        vec2 f = fract(st) - 0.5;
        if (hexDistance(f) > 0.43) {
            rgb *= 0.35;
        }
    } 
    else if (u_animalId == 5) {
        // Pit Viper Snake: Thermal Infrared Heat Vision
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        float thermalLuma = pow(luma, 0.8) * (u_nightGain * 1.2);
        rgb = getThermalColor(thermalLuma);
    } 
    else if (u_animalId == 6) {
        // Owl: High-gain low-light rods & binocular tunnel vision
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        vec3 owlTint = vec3(luma * 0.85, luma * 1.15, luma * 0.9) * (u_nightGain * 1.4);
        float dist = distance(uv, vec2(0.5));
        rgb = owlTint * smoothstep(0.65, 0.2, dist);
    } 
    else if (u_animalId == 7) {
        // Shark: Deep Marine Cyan Monochromacy
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.08, luma * 0.75, luma * 0.92) * (u_nightGain * 1.1);
    } 
    else if (u_animalId == 8) {
        // Horse: Central Midline Nose Blindspot
        float distCenter = abs(uv.x - 0.5);
        if (distCenter < 0.045) {
            float blindFactor = smoothstep(0.045, 0.005, distCenter);
            rgb = mix(rgb, vec3(0.02, 0.02, 0.02), blindFactor * 0.96);
        }
    } 
    else if (u_animalId == 9) {
        // Bullfrog: Edge Motion Bug Detector
        vec4 prevColor = texture2D(u_prevTexture, uv);
        vec3 diff = abs(rgb - prevColor.rgb);
        float motion = dot(diff, vec3(0.333));
        float thresh = max(0.01, 0.25 - u_motionSensitivity * 0.2);
        if (motion > thresh) {
            rgb = vec3(0.86, 1.0, 0.2);
        } else {
            float grey = dot(rgb, vec3(0.299, 0.587, 0.114));
            rgb = vec3(grey * 0.25, grey * 0.3, grey * 0.25);
        }
    } 
    else if (u_animalId == 10) {
        // Mantis Shrimp: Hyper-spectral 16-channel saturation & polarization rings
        vec3 sat = mix(vec3(dot(rgb, vec3(0.333))), rgb, 1.75);
        float ring = sin(length(uv - vec2(0.5)) * 35.0 - u_time * 5.0);
        vec3 polOverlay = vec3(sin(u_time + uv.x * 8.0) * 0.12, cos(u_time + uv.y * 8.0) * 0.12, 0.16);
        rgb = sat + polOverlay * (ring * 0.5 + 0.5);
    } 
    else if (u_animalId == 11) {
        // Deer: UV fabric sensitivity
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        if (rgb.b > 0.58 && luma > 0.45) {
            rgb.r = min(1.0, rgb.r + 0.35);
            rgb.b = 1.0;
            rgb.g = max(0.0, rgb.g - 0.2);
        }
        rgb *= u_nightGain;
    }
    else if (u_animalId == 12) {
        // Wolf: Low-light forest night dichromacy & tapetum gain
        rgb = pow(rgb, vec3(0.9)) * (u_nightGain * 1.35);
        rgb.r = mix(rgb.r, rgb.g, 0.5);
    }
    else if (u_animalId == 13) {
        // Fox: Crepuscular twilight motion tracking
        rgb *= (u_nightGain * 1.25);
        vec4 prevColor = texture2D(u_prevTexture, uv);
        float motion = length(rgb - prevColor.rgb);
        if (motion > 0.08) {
            rgb = mix(rgb, vec3(1.0, 0.85, 0.2), 0.4);
        }
    }
    else if (u_animalId == 14) {
        // Lion: Savannah twilight low-contrast golden glow
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 1.1, luma * 0.95, luma * 0.6) * (u_nightGain * 1.2);
    }
    else if (u_animalId == 15) {
        // Tiger: Red-green colorblind prey perspective (oranges blend into green)
        rgb.r = mix(rgb.r, rgb.g, 0.7);
    }
    else if (u_animalId == 16) {
        // Leopard: High-contrast nocturnal tapetum
        rgb = clamp((rgb - 0.5) * 1.25 + 0.5, 0.0, 1.0) * (u_nightGain * 1.4);
    }
    else if (u_animalId == 17) {
        // Bat: Echolocation sonar grid overlay + high gain
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.3, luma * 0.85, luma * 1.0) * (u_nightGain * 1.5);
        float grid = sin(uv.x * 120.0) * sin(uv.y * 120.0);
        if (grid > 0.8) {
            rgb += vec3(0.0, 0.2, 0.3);
        }
    }
    else if (u_animalId == 18) {
        // Dolphin: Ocean cyan-blue contrast monochromacy
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.1, luma * 0.7, luma * 0.95);
    }
    else if (u_animalId == 19) {
        // Squirrel: High acuity daylight dichromacy
        rgb.r = mix(rgb.r, rgb.g, 0.4);
        rgb = clamp((rgb - 0.5) * 1.2 + 0.5, 0.0, 1.0);
    }
    else if (u_animalId == 20) {
        // Rabbit: 360 panoramic wide peripheral motion blur
        float dist = distance(uv, vec2(0.5));
        rgb *= smoothstep(0.8, 0.3, dist);
    }
    else if (u_animalId == 21) {
        // Falcon: High speed motion frame tracking + central zoom
        rgb = clamp((rgb - 0.5) * 1.35 + 0.5, 0.0, 1.0);
        vec2 center = vec2(0.5, 0.5);
        if (distance(uv, center) < 0.22) {
            rgb.r = min(1.0, rgb.r * 1.15);
        }
    }
    else if (u_animalId == 22) {
        // Hummingbird: Tetrachromatic UV floral nectar highlights
        if (rgb.r > 0.5 && rgb.b > 0.4) {
            rgb = mix(rgb, vec3(1.0, 0.1, 0.8), 0.6);
        }
    }
    else if (u_animalId == 23) {
        // Pigeon: Polarized light sky compass & UV bands
        float skyAngle = atan(uv.y - 0.5, uv.x - 0.5);
        float band = sin(skyAngle * 6.0 + u_time * 2.0);
        rgb += vec3(band * 0.1, band * 0.15, band * 0.2);
    }
    else if (u_animalId == 24) {
        // Parrot: Hyper tetrachromatic UV feather glow
        rgb = mix(rgb, vec3(rgb.b, rgb.r, rgb.g * 1.3), 0.35) * 1.2;
    }
    else if (u_animalId == 25) {
        // Flamingo: Rosy pink algae contrast filter
        rgb.r = min(1.0, rgb.r * 1.3);
        rgb.b = min(1.0, rgb.b * 1.15);
    }
    else if (u_animalId == 26) {
        // Penguin: Underwater blue refraction shift
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = mix(rgb, vec3(luma * 0.2, luma * 0.65, luma * 0.95), 0.7);
    }
    else if (u_animalId == 27) {
        // Crow: High acuity UV contrast
        rgb = clamp((rgb - 0.5) * 1.3 + 0.5, 0.0, 1.0);
    }
    else if (u_animalId == 28) {
        // Chameleon: Independent 360 monocular split view
        if (uv.x > 0.498 && uv.x < 0.502) {
            rgb = vec3(0.0, 1.0, 0.5);
        }
    }
    else if (u_animalId == 29) {
        // Gecko: Nocturnal ultra-color vision
        rgb = rgb * (u_nightGain * 2.2);
        rgb = mix(rgb, vec3(dot(rgb, vec3(0.333))), -0.3);
    }
    else if (u_animalId == 30) {
        // Iguana: Parietal third eye solar sensor spot at top
        vec2 topSpot = vec2(0.5, 0.05);
        if (distance(uv, topSpot) < 0.03) {
            rgb = vec3(1.0, 0.9, 0.2);
        }
    }
    else if (u_animalId == 31) {
        // Alligator: Crimson tapetum & murky water membrane
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 1.1, luma * 0.7, luma * 0.2) * (u_nightGain * 1.3);
    }
    else if (u_animalId == 32) {
        // Sea Turtle: Marine green-blue spectrum & polarization
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.15, luma * 0.8, luma * 0.85);
    }
    else if (u_animalId == 33) {
        // Salamander: Subterranean thermal contrast
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = getThermalColor(luma) * 0.85;
    }
    else if (u_animalId == 34) {
        // Toad: Motion bug detector & low light
        vec4 prevColor = texture2D(u_prevTexture, uv);
        float motion = length(rgb - prevColor.rgb);
        if (motion > 0.05) {
            rgb = vec3(0.2, 1.0, 0.4);
        } else {
            rgb *= 0.5;
        }
    }
    else if (u_animalId == 35) {
        // Axolotl: Murky water monochrome
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.4, luma * 0.6, luma * 0.5);
    }
    else if (u_animalId == 36) {
        // Goldfish: IR + UV tetrachromat cyan-magenta shift
        rgb = vec3(rgb.b, rgb.g * 1.2, rgb.r * 1.3);
    }
    else if (u_animalId == 37) {
        // Deep Sea Angler: Pitch black abyss with bioluminescent glow
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        if (luma > 0.6) {
            rgb = vec3(0.2, 0.9, 1.0) * 1.5;
        } else {
            rgb = vec3(0.01, 0.02, 0.05);
        }
    }
    else if (u_animalId == 38) {
        // Archerfish: Refraction distortion lines & target crosshair
        if (abs(uv.x - 0.5) < 0.0015 || abs(uv.y - 0.5) < 0.0015) {
            rgb = vec3(1.0, 0.2, 0.2);
        }
    }
    else if (u_animalId == 39) {
        // Clownfish: Anemone UV contrast stripes
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.2, luma * 0.75, luma * 1.0);
    }
    else if (u_animalId == 40) {
        // Swordfish: Warm retina high-speed tracking
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.1, luma * 0.6, luma * 1.0) * 1.2;
    }
    else if (u_animalId == 41) {
        // Dragonfly: 30,000 ommatidia hex grid & motion
        float hexSize = max(0.008, 0.035 - (u_compoundScale / 100.0) * 0.025);
        vec2 aspect = vec2(u_resolution.x / max(1.0, u_resolution.y), 1.0);
        vec2 st = uv * aspect / hexSize;
        if (hexDistance(fract(st) - 0.5) > 0.44) {
            rgb *= 0.4;
        }
    }
    else if (u_animalId == 42) {
        // Butterfly: 15-photoreceptor UV nectar guide patterns
        rgb = mix(rgb, vec3(rgb.b, rgb.r * 1.2, rgb.g * 0.8), 0.5);
    }
    else if (u_animalId == 43) {
        // Fly: Compound grid & high speed perception
        float hexSize = 0.03;
        vec2 aspect = vec2(u_resolution.x / max(1.0, u_resolution.y), 1.0);
        vec2 st = uv * aspect / hexSize;
        if (hexDistance(fract(st) - 0.5) > 0.42) {
            rgb *= 0.3;
        }
    }
    else if (u_animalId == 44) {
        // Ant: Sky polarization compass grid
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.8, luma * 0.8, luma * 1.0);
    }
    else if (u_animalId == 45) {
        // Praying Mantis: 3D binocular stereoscopic depth
        float dist = distance(uv, vec2(0.5));
        rgb.r += (1.0 - dist) * 0.2;
        rgb.b += dist * 0.2;
    }
    else if (u_animalId == 46 || u_animalId == 47) {
        // Octopus & Cuttlefish: Dumbbell pupil polarization filter
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        float band = sin(uv.y * 50.0 + u_time * 3.0);
        rgb = vec3(luma * 0.7, luma * 0.85, luma * 0.9) + vec3(band * 0.05);
    }
    else if (u_animalId == 48) {
        // Jellyfish: Rhopalia diffuse light spot mosaic
        float hexSize = 0.08;
        vec2 st = floor(uv / hexSize) * hexSize;
        rgb = texture2D(u_texture, st).rgb;
    }
    else if (u_animalId == 49) {
        // Walrus: Arctic ice tapetum shadow contrast
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.5, luma * 0.8, luma * 1.0) * (u_nightGain * 1.2);
    }
    else if (u_animalId == 50) {
        // Elephant: Dichromat + bottom trunk blindspot
        rgb.r = mix(rgb.r, rgb.g, 0.6);
        if (uv.y > 0.82 && abs(uv.x - 0.5) < 0.15) {
            rgb *= 0.2;
        }
    }
    else if (u_animalId == 51) {
        // Cheetah: High speed streak motion & sharp central horizon
        float distY = abs(uv.y - 0.5);
        if (distY < 0.1) {
            rgb = clamp((rgb - 0.5) * 1.4 + 0.5, 0.0, 1.0);
        }
    }
    else if (u_animalId == 52) {
        // Bear: Red-berry contrast enhancement in forest
        if (rgb.r > 0.4 && rgb.g < 0.4) {
            rgb.r = min(1.0, rgb.r * 1.3);
        }
    }
    else if (u_animalId == 53) {
        // Rat: Dual ocular offset + red-blindness
        rgb.r = rgb.g * 0.5;
    }
    else if (u_animalId == 54) {
        // Mole: Near total blindness thresholding
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = luma > 0.5 ? vec3(0.8) : vec3(0.05);
    }
    else if (u_animalId == 55) {
        // Hawk: Sharp telephoto central zoom + high contrast
        rgb = clamp((rgb - 0.5) * 1.4 + 0.5, 0.0, 1.0);
    }
    else if (u_animalId == 56) {
        // Woodpecker: Monocular side contrast + shock stabilization ring
        float ring = distance(uv, vec2(0.5));
        rgb *= smoothstep(0.7, 0.2, ring);
    }
    else if (u_animalId == 57) {
        // Albatross: Ocean glare reduction + horizon polarization line
        if (abs(uv.y - 0.5) < 0.002) {
            rgb = vec3(0.0, 0.9, 1.0);
        }
    }
    else if (u_animalId == 58) {
        // King Cobra: High contrast amber tracker
        rgb = vec3(rgb.r * 1.1, rgb.g * 0.9, rgb.b * 0.5);
    }
    else if (u_animalId == 59) {
        // Python: Lip pit labial thermal heatmap circles
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        vec3 therm = getThermalColor(luma);
        rgb = mix(rgb, therm, 0.65);
    }
    else if (u_animalId == 60) {
        // Boa: Vertical slit low light twilight vision
        rgb *= (u_nightGain * 1.2);
    }
    else if (u_animalId == 61) {
        // Crocodile: Submerged transparent membrane greenish tint + night tapetum
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.2, luma * 0.85, luma * 0.4) * (u_nightGain * 1.3);
    }
    else if (u_animalId == 62) {
        // Monitor Lizard: High motion sensitivity + daytime dichromat
        rgb.r = mix(rgb.r, rgb.g, 0.5);
    }
    else if (u_animalId == 63) {
        // Komodo Dragon: 300m daytime tracking contrast boost
        rgb = clamp((rgb - 0.5) * 1.35 + 0.5, 0.0, 1.0);
    }
    else if (u_animalId == 64) {
        // Turtle: Red oil droplet filter (boosts reds & greens)
        rgb.r = min(1.0, rgb.r * 1.25);
        rgb.g = min(1.0, rgb.g * 1.15);
    }
    else if (u_animalId == 65) {
        // Newt: Polarized light sky compass + UV reflection
        float band = sin(uv.y * 30.0 + u_time * 2.0);
        rgb += vec3(0.0, band * 0.1, band * 0.15);
    }
    else if (u_animalId == 66) {
        // Tuna: Open ocean pelagic blue specialist + high motion
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.05, luma * 0.6, luma * 0.98);
    }
    else if (u_animalId == 67) {
        // Salmon: Near-infrared river navigation shift
        rgb.r = min(1.0, rgb.r * 1.4);
        rgb.b = max(0.0, rgb.b - 0.2);
    }
    else if (u_animalId == 68) {
        // Stingray: Dorsal top view + sand shadow contrast
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.3, luma * 0.7, luma * 0.75);
    }
    else if (u_animalId == 69) {
        // Electric Eel: Pitch-black murky water + electric 3D pulse wave circles
        float dist = distance(uv, vec2(0.5));
        float pulse = sin(dist * 40.0 - u_time * 8.0);
        rgb = vec3(0.0, pulse * 0.4, pulse * 0.6);
    }
    else if (u_animalId == 70) {
        // Piranha: Amazon murky water green tint + motion highlight
        vec4 prevColor = texture2D(u_prevTexture, uv);
        float motion = length(rgb - prevColor.rgb);
        if (motion > 0.06) {
            rgb = vec3(1.0, 0.2, 0.2);
        } else {
            rgb = vec3(rgb.r * 0.4, rgb.g * 0.8, rgb.b * 0.3);
        }
    }
    else if (u_animalId == 71) {
        // Whale: Pelagic ocean blue tint + low light tapetum
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.1, luma * 0.5, luma * 0.85);
    }
    else if (u_animalId == 72) {
        // Orca: High-contrast ocean blue + peripheral black vignette
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        float dist = distance(uv, vec2(0.5));
        rgb = vec3(luma * 0.1, luma * 0.65, luma * 0.95) * smoothstep(0.8, 0.2, dist);
    }
    else if (u_animalId == 73) {
        // Squid: Giant eye abyssal blue sensitivity + bioluminescent whale shadow detector
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.05, luma * 0.7, luma * 1.0) * (u_nightGain * 1.5);
    }
    else if (u_animalId == 74) {
        // Seal: Underwater tapetum lucidum green glow
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.2, luma * 0.8, luma * 0.7) * (u_nightGain * 1.3);
    }
    else if (u_animalId == 75) {
        // Seahorse: Independent 3D swiveling split view
        if (uv.x > 0.498 && uv.x < 0.502) {
            rgb = vec3(0.0, 0.8, 0.9);
        }
    }
    else if (u_animalId == 76) {
        // Starfish: 5-arm tip compound ocelli blur mosaic
        float hexSize = 0.12;
        vec2 st = floor(uv / hexSize) * hexSize;
        rgb = texture2D(u_texture, st).rgb;
    }
    else if (u_animalId == 77) {
        // Bumble Bee: Fast UV flight grid + electric field flower glow
        float hexSize = 0.04;
        vec2 aspect = vec2(u_resolution.x / max(1.0, u_resolution.y), 1.0);
        vec2 st = uv * aspect / hexSize;
        if (hexDistance(fract(st) - 0.5) > 0.43) {
            rgb *= 0.35;
        }
    }
    else if (u_animalId == 78) {
        // Moth: Superposition compound starlight enhancement
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(luma * 0.6, luma * 0.9, luma * 1.0) * (u_nightGain * 1.6);
    }
    else if (u_animalId == 79) {
        // Mosquito: Thermal host heat + CO2 dark silhouette highlight
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        if (luma < 0.3) {
            rgb = vec3(0.9, 0.1, 0.1);
        } else {
            rgb = vec3(luma * 0.3, luma * 0.5, luma * 0.4);
        }
    }
    else if (u_animalId == 80) {
        // Termite: Pitch-black subterranean tunnel blindness
        rgb = vec3(0.02, 0.02, 0.02);
    }
    else if (u_animalId == 81) {
        // Dung Beetle: Milky Way galaxy starlight polarization band
        float band = sin((uv.x + uv.y) * 15.0 + u_time * 2.0);
        rgb += vec3(band * 0.15, band * 0.2, band * 0.3);
    }
    else if (u_animalId == 82) {
        // Grasshopper: Wide horizon pan + simple forehead ocelli light indicator
        float distY = abs(uv.y - 0.5);
        rgb *= smoothstep(0.9, 0.1, distY);
    }
    else if (u_animalId == 83) {
        // Cricket: Twilight grass roots dichromacy
        rgb *= (u_nightGain * 1.3);
        rgb.r = mix(rgb.r, rgb.g, 0.5);
    }
    else if (u_animalId == 84) {
        // Firefly: 562nm yellow-green bioluminescent flash glow filter
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        if (luma > 0.5) {
            rgb = vec3(0.7, 1.0, 0.1) * 1.3;
        }
    }
    else if (u_animalId == 85) {
        // Jumping Spider: Telephoto HD central fovea + 6-eye peripheral boundary
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(uv, center);
        if (dist > 0.35) {
            rgb *= 0.5;
        } else {
            rgb = clamp((rgb - 0.5) * 1.3 + 0.5, 0.0, 1.0);
        }
    }
    else if (u_animalId == 86) {
        // Orb Weaver Spider: Web UV reflection glow
        if (rgb.b > 0.4) {
            rgb = vec3(0.3, 0.6, 1.0);
        }
    }
    else if (u_animalId == 87) {
        // Tarantula: Burrow entrance shadow sensitivity
        float dist = distance(uv, vec2(0.5));
        rgb *= smoothstep(0.8, 0.2, dist);
    }
    else if (u_animalId == 88) {
        // Scorpion: Carapace full-body UV cyan fluorescence glow
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = vec3(0.0, luma * 0.9, luma * 1.0) * (u_nightGain * 1.5);
    }

    gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`;

export interface WebGLProgramContext {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  positionBuffer: WebGLBuffer;
  texCoordBuffer: WebGLBuffer;
  texture: WebGLTexture;
  prevTexture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  uniforms: {
    u_texture: WebGLUniformLocation | null;
    u_prevTexture: WebGLUniformLocation | null;
    u_time: WebGLUniformLocation | null;
    u_resolution: WebGLUniformLocation | null;
    u_animalId: WebGLUniformLocation | null;
    u_intensity: WebGLUniformLocation | null;
    u_nightGain: WebGLUniformLocation | null;
    u_zoomLevel: WebGLUniformLocation | null;
    u_compoundScale: WebGLUniformLocation | null;
    u_motionSensitivity: WebGLUniformLocation | null;
    u_colorMatrix: WebGLUniformLocation | null;
    u_hasColorMatrix: WebGLUniformLocation | null;
    u_comparisonActive: WebGLUniformLocation | null;
    u_comparisonSplit: WebGLUniformLocation | null;
  };
}

export function initWebGLContext(canvas: HTMLCanvasElement): WebGLProgramContext | null {
  const gl = (canvas.getContext('webgl', {
    powerPreference: 'high-performance',
    alpha: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
  }) || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

  if (!gl) {
    console.warn('WebGL not supported on this browser context');
    return null;
  }

  // Compile Vertex Shader
  const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertShader, VERTEX_SHADER_SOURCE);
  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertShader));
    return null;
  }

  // Compile Fragment Shader
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragShader, FRAGMENT_SHADER_SOURCE);
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragShader));
    return null;
  }

  // Create Program
  const program = gl.createProgram()!;
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('WebGL program link failed:', gl.getProgramInfoLog(program));
    return null;
  }

  gl.useProgram(program);

  // Position buffer (full clip quad)
  const positionBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]),
    gl.STATIC_DRAW
  );

  const posLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLocation);
  gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

  // Texture coordinates buffer
  const texCoordBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]),
    gl.STATIC_DRAW
  );

  const texLocation = gl.getAttribLocation(program, 'a_texCoord');
  gl.enableVertexAttribArray(texLocation);
  gl.vertexAttribPointer(texLocation, 2, gl.FLOAT, false, 0, 0);

  // Setup main input texture
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Setup previous frame texture for motion detection
  const prevTexture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, prevTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const framebuffer = gl.createFramebuffer()!;

  const uniforms = {
    u_texture: gl.getUniformLocation(program, 'u_texture'),
    u_prevTexture: gl.getUniformLocation(program, 'u_prevTexture'),
    u_time: gl.getUniformLocation(program, 'u_time'),
    u_resolution: gl.getUniformLocation(program, 'u_resolution'),
    u_animalId: gl.getUniformLocation(program, 'u_animalId'),
    u_intensity: gl.getUniformLocation(program, 'u_intensity'),
    u_nightGain: gl.getUniformLocation(program, 'u_nightGain'),
    u_zoomLevel: gl.getUniformLocation(program, 'u_zoomLevel'),
    u_compoundScale: gl.getUniformLocation(program, 'u_compoundScale'),
    u_motionSensitivity: gl.getUniformLocation(program, 'u_motionSensitivity'),
    u_colorMatrix: gl.getUniformLocation(program, 'u_colorMatrix'),
    u_hasColorMatrix: gl.getUniformLocation(program, 'u_hasColorMatrix'),
    u_comparisonActive: gl.getUniformLocation(program, 'u_comparisonActive'),
    u_comparisonSplit: gl.getUniformLocation(program, 'u_comparisonSplit'),
  };

  return {
    gl,
    program,
    positionBuffer,
    texCoordBuffer,
    texture,
    prevTexture,
    framebuffer,
    uniforms,
  };
}

export function animalIdToNumeric(id: string): number {
  switch (id) {
    case 'human': return 0;
    case 'dog': return 1;
    case 'cat': return 2;
    case 'eagle': return 3;
    case 'bee': return 4;
    case 'snake': return 5;
    case 'owl': return 6;
    case 'shark': return 7;
    case 'horse': return 8;
    case 'frog': return 9;
    case 'mantis_shrimp': return 10;
    case 'deer': return 11;
    case 'wolf': return 12;
    case 'fox': return 13;
    case 'lion': return 14;
    case 'tiger': return 15;
    case 'leopard': return 16;
    case 'bat': return 17;
    case 'dolphin': return 18;
    case 'squirrel': return 19;
    case 'rabbit': return 20;
    case 'falcon': return 21;
    case 'hummingbird': return 22;
    case 'pigeon': return 23;
    case 'parrot': return 24;
    case 'flamingo': return 25;
    case 'penguin': return 26;
    case 'crow': return 27;
    case 'chameleon': return 28;
    case 'gecko': return 29;
    case 'iguana': return 30;
    case 'alligator': return 31;
    case 'sea_turtle': return 32;
    case 'salamander': return 33;
    case 'toad': return 34;
    case 'axolotl': return 35;
    case 'goldfish': return 36;
    case 'deep_sea_angler': return 37;
    case 'archerfish': return 38;
    case 'clownfish': return 39;
    case 'swordfish': return 40;
    case 'dragonfly': return 41;
    case 'butterfly': return 42;
    case 'fly': return 43;
    case 'ant': return 44;
    case 'praying_mantis': return 45;
    case 'octopus': return 46;
    case 'cuttlefish': return 47;
    case 'jellyfish': return 48;
    case 'walrus': return 49;
    case 'elephant': return 50;
    case 'cheetah': return 51;
    case 'bear': return 52;
    case 'rat': return 53;
    case 'mole': return 54;
    case 'hawk': return 55;
    case 'woodpecker': return 56;
    case 'albatross': return 57;
    case 'king_cobra': return 58;
    case 'python': return 59;
    case 'boa': return 60;
    case 'crocodile': return 61;
    case 'monitor_lizard': return 62;
    case 'komodo_dragon': return 63;
    case 'turtle': return 64;
    case 'newt': return 65;
    case 'tuna': return 66;
    case 'salmon': return 67;
    case 'stingray': return 68;
    case 'electric_eel': return 69;
    case 'piranha': return 70;
    case 'whale': return 71;
    case 'orca': return 72;
    case 'squid': return 73;
    case 'seal': return 74;
    case 'seahorse': return 75;
    case 'starfish': return 76;
    case 'bumble_bee': return 77;
    case 'moth': return 78;
    case 'mosquito': return 79;
    case 'termite': return 80;
    case 'dung_beetle': return 81;
    case 'grasshopper': return 82;
    case 'cricket': return 83;
    case 'firefly': return 84;
    case 'jumping_spider': return 85;
    case 'orb_weaver_spider': return 86;
    case 'tarantula': return 87;
    case 'scorpion': return 88;
    default: return 0;
  }
}
