import React, { useEffect, useState, useRef } from 'react';

/**
 * NeuralBrain3D - High-fidelity 3D Brain Visualizer
 * Uses embedded Sketchfab point cloud overlaid with internal UI telemetry.
 * @param {boolean} isReasoning - If true, neurons fire in multi-color spectrum.
 */
const NeuralBrain3D = ({ isReasoning: propIsReasoning = false }) => {
    const [localIsReasoning, setLocalIsReasoning] = useState(false);
    const [learningLogs, setLearningLogs] = useState([]);
    const isReasoning = propIsReasoning || localIsReasoning;

    // Ref de Canvas para motor 3D
    const canvasRef = useRef(null);
    const rotationRef = useRef({ x: 0.2, y: 0 }); // Usar refs para rotación fluida sin re-renders
    const dragRef = useRef({ isDragging: false, lastX: 0, lastY: 0 });

    // 1. Efecto para los logs dinámicos de texto
    useEffect(() => {
        let logInterval;
        const intervalTime = isReasoning ? 800 : 2000; // Velocidad de logs dinámica
        
        if (isReasoning) {
            const possibleLogs = [
                "PROCESANDO_600K_REGISTROS_BOLETOS",
                "IDENTIFICANDO_CLUSTER_USUARIOS_VIP",
                "CALCULANDO_RIESGO_DE_CANCELACION",
                "SIMULANDO_COMPORTAMIENTO_DE_USUARIOS",
                "SINCRONIZANDO_CATEGORIAS_DE_EVENTOS",
                "REFINANDO_MODELO_PREDICTIVO_INGRESOS",
                "DETECTANDO_ANOMALIAS_EN_REVENTA",
                "MAPA_NEURONAL_LISTO: CLUSTER_LAIKA_V1"
            ];
            logInterval = setInterval(() => {
                setLearningLogs(prev => [
                    possibleLogs[Math.floor(Math.random() * possibleLogs.length)],
                    ...prev
                ].slice(0, 5));
            }, intervalTime);
        } else {
            setLearningLogs([]);
        }
        return () => clearInterval(logInterval);
    }, [isReasoning]);

    // 2. Manejadores de interacción (Mouse / Touch)
    const handlePointerDown = (e) => {
        dragRef.current = {
            isDragging: true,
            lastX: e.clientX,
            lastY: e.clientY
        };
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!dragRef.current.isDragging) return;
        const deltaX = e.clientX - dragRef.current.lastX;
        const deltaY = e.clientY - dragRef.current.lastY;
        
        rotationRef.current.y -= deltaX * 0.005;
        rotationRef.current.x -= deltaY * 0.005;
        
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
    };

    const handlePointerUp = (e) => {
        dragRef.current.isDragging = false;
        e.target.releasePointerCapture(e.pointerId);
    };

    // 3. Efecto para el Motor 3D Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        const width = 800;
        const height = 800;
        
        canvas.width = width * 2;
        canvas.height = height * 2;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.scale(2, 2);

        const particles = [];
        const numParticles = 1000;

        for (let i = 0; i < numParticles; i++) {
            let x, y, z;
            do {
                x = (Math.random() - 0.5) * 2;
                y = (Math.random() - 0.5) * 2;
                z = (Math.random() - 0.5) * 2;
            } while (
                (Math.pow(x, 2)/1.2 + Math.pow(y, 2)/0.8 + Math.pow(z, 2)/1.6 > 1) 
                || (Math.abs(x) < 0.08)
                || (y > 0.4 && z > -0.2 && Math.abs(x) < 0.4)
            );
            
            particles.push({
                origX: x * 180,
                origY: y * 160,
                origZ: z * 210,
                baseSize: Math.random() * 1.5 + 0.5,
                rgb: `255, 255, 255`,
                px: 0, py: 0, alpha: 0, isGlowing: false, zoneColor: ''
            });
        }

        const edges = [];
        const connectionThreshold = 38;
        for (let i = 0; i < numParticles; i++) {
            let p1 = particles[i];
            let connections = 0;
            for (let j = i + 1; j < numParticles; j++) {
                if (connections >= 2) break;
                let p2 = particles[j];
                let dist = Math.sqrt(
                    Math.pow(p1.origX - p2.origX, 2) +
                    Math.pow(p1.origY - p2.origY, 2) +
                    Math.pow(p1.origZ - p2.origZ, 2)
                );
                if (dist < connectionThreshold) {
                    edges.push([i, j]);
                    connections++;
                }
            }
        }

        const zones = [
            { name: "frontal",   x: 0,    y: -50,  z: 160,  radius: 80,  color: "255, 255, 255" },
            { name: "parietal",  x: 0,    y: -120, z: -40,  radius: 80,  color: "220, 220, 220" },
            { name: "occipital", x: 0,    y: 0,    z: -160, radius: 70,  color: "255, 255, 255" },
            { name: "temporal L",x: -140, y: 40,   z: -20,  radius: 60,  color: "220, 220, 220" },
            { name: "temporal R",x: 140,  y: 40,   z: -20,  radius: 60,  color: "255, 255, 255" }
        ];

        ctx.lineCap = "round";

        const render = (time) => {
            // Rotación automática + Dragging
            const autoSpeed = isReasoning ? 0.015 : 0.003;
            if (!dragRef.current.isDragging) {
                rotationRef.current.y -= autoSpeed;
            }

            const cosY = Math.cos(rotationRef.current.y);
            const sinY = Math.sin(rotationRef.current.y);
            const cosX = Math.cos(rotationRef.current.x);
            const sinX = Math.sin(rotationRef.current.x);

            ctx.fillStyle = '#0a0a0d';
            ctx.fillRect(0, 0, width, height);

            // Luz Inferior (Underlight) Blanca
            const gradient = ctx.createRadialGradient(
                width / 2, height, 0,
                width / 2, height, height * 0.7
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Tiempo de ciclo dinámico (más rápido si razona)
            const cycleTime = isReasoning ? 800 : 2000;
            const activeZoneIndex = isReasoning ? (Math.floor(time / cycleTime) % zones.length) : -1;
            const cycleProgress = (time % cycleTime) / cycleTime;
            const pulse = Math.sin(cycleProgress * Math.PI); 

            // HUD / AURA DE ENERGÍA DE FONDO (Más potente si razona)
            if (isReasoning) {
                const auraGradient = ctx.createRadialGradient(
                    width / 2, height / 2, 50,
                    width / 2, height / 2, 350
                );
                auraGradient.addColorStop(0, `rgba(255, 255, 255, ${0.05 * pulse})`);
                auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = auraGradient;
                ctx.fillRect(0, 0, width, height);
            }

            ctx.globalCompositeOperation = 'screen';

            for (let i = 0; i < numParticles; i++) {
                let p = particles[i];
                let rx = p.origX * cosY - p.origZ * sinY;
                let rz = p.origX * sinY + p.origZ * cosY;
                let ry = p.origY * cosX - rz * sinX;
                let fz = p.origY * sinX + rz * cosX;

                const perspective = 700 / (700 + fz);
                const px = (width / 2) + rx * perspective;
                const py = (height / 2 - 80) + ry * perspective;

                let isGlowing = false;
                let zoneColor = p.rgb;
                let sizeMult = 1;
                let alpha = perspective * 0.4;

                if (activeZoneIndex > -1) {
                    const zNode = zones[activeZoneIndex];
                    const dist = Math.sqrt(
                        Math.pow(p.origX - zNode.x, 2) + 
                        Math.pow(p.origY - zNode.y, 2) + 
                        Math.pow(p.origZ - zNode.z, 2)
                    );
                    
                    if (dist < zNode.radius) {
                        isGlowing = true;
                        zoneColor = zNode.color;
                        const factor = 1 - (dist / zNode.radius);
                        alpha = Math.min(1, alpha + (pulse * factor));
                        sizeMult = 1 + (pulse * factor * 2.5);
                    }
                } else {
                    alpha *= 0.3;
                }

                p.px = px; p.py = py; p.isGlowing = isGlowing;
                p.zoneColor = zoneColor; p.alpha = alpha;

                const finalSize = p.baseSize * perspective * sizeMult;
                ctx.beginPath();
                ctx.arc(px, py, finalSize, 0, Math.PI * 2);
                
                if (isGlowing) {
                    // Ignición extrema: más brillo y más luz
                    ctx.shadowBlur = Math.floor(25 * pulse) + 5;
                    ctx.shadowColor = `rgba(${zoneColor}, 0.8)`;
                    ctx.fillStyle = `rgba(${zoneColor}, ${Math.min(1, alpha * 1.5)})`;
                } else {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = `rgba(${zoneColor}, ${alpha})`;
                }
                ctx.fill();
            }

            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;
            ctx.shadowBlur = 0;
            for (let e = 0; e < edges.length; e++) {
                const p1 = particles[edges[e][0]];
                const p2 = particles[edges[e][1]];
                if (!(p1.isGlowing && p2.isGlowing)) {
                    ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py);
                }
            }
            ctx.stroke();

            ctx.beginPath();
            let currentColor = null;
            for (let e = 0; e < edges.length; e++) {
                const p1 = particles[edges[e][0]];
                const p2 = particles[edges[e][1]];
                if (p1.isGlowing && p2.isGlowing && p1.zoneColor === p2.zoneColor) {
                    if (currentColor !== p1.zoneColor) {
                        ctx.stroke(); ctx.beginPath();
                        ctx.strokeStyle = `rgba(${p1.zoneColor}, ${Math.max(p1.alpha, p2.alpha) * 0.6})`;
                        ctx.shadowBlur = Math.floor(10 * pulse);
                        ctx.shadowColor = `rgba(${p1.zoneColor}, 0.8)`;
                        currentColor = p1.zoneColor;
                    }
                    ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py);
                }
            }
            ctx.stroke();

            ctx.globalCompositeOperation = 'source-over';
            animationFrameId = requestAnimationFrame(render);
        };

        render(0);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isReasoning]);

    return (
        <div 
            className="neural-brain-container" 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
                width: '100%',
                height: '900px', 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#000',
                borderRadius: '40px',
                position: 'relative',
                overflow: 'hidden',
                border: isReasoning ? '2px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: isReasoning 
                    ? '0 0 100px rgba(255,255,255,0.05), inset 0 0 150px rgba(255,255,255,0.02)' 
                    : 'inset 0 -100px 200px rgba(255,255,255,0.02)',
                transition: 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1)',
                cursor: dragRef.current.isDragging ? 'grabbing' : 'grab',
                touchAction: 'none'
            }}
        >
            {/* ESTILO SUTIL MONOCROMÁTICO Y SEGURO PARA WEBGL */}
            <style>
                {`
                @keyframes neuralPulseShadow {
                    0% { box-shadow: 0 80px 200px rgba(0,0,0,0.8), inset 0 0 350px rgba(0,0,0,0.9); }
                    100% { box-shadow: 0 40px 120px rgba(255,255,255,0.03), inset 0 0 350px rgba(0,0,0,0.85); }
                }
                `}
            </style>
            
            {/* MOTOR 3D CANVAS - Genuino Rotatorio y Optimizado */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <canvas 
                    ref={canvasRef}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        filter: 'drop-shadow(0 0 60px rgba(255, 255, 255, 0.05))'
                    }}
                />
            </div>
            
            {/* Dynamic Learning Stream overlay */}
            {isReasoning && learningLogs.length > 0 && (
                <div style={{
                    position: 'absolute', top: '80px', width: '100%',
                    display: 'flex', justifyContent: 'center',
                    pointerEvents: 'none', zIndex: 11
                }}>
                    <div style={{
                        color: '#fff', fontSize: '10px', fontWeight: '700', fontFamily: 'monospace',
                        letterSpacing: '4px', textShadow: '0 0 10px rgba(255,255,255,0.4)',
                        opacity: 0.8
                    }}>
                        ▶ {learningLogs[0]}
                    </div>
                </div>
            )}


            {/* Main Interactive Action Button */}
            <button 
                onClick={() => setLocalIsReasoning(!localIsReasoning)}
                style={{
                    position: 'absolute', bottom: '40px', padding: '15px 45px',
                    background: isReasoning ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: '50px', fontSize: '12px', fontWeight: '800',
                    letterSpacing: '8px', cursor: 'pointer', backdropFilter: 'blur(30px)',
                    transition: 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)', zIndex: 10,
                    boxShadow: isReasoning ? '0 0 40px rgba(255, 255, 255, 0.15)' : '0 10px 40px rgba(0, 0, 0, 0.5)'
                }}
            >
                {isReasoning ? 'SISTEMA_SINCRONIZADO' : 'INICIALIZAR_NÚCLEO'}
            </button>

        </div>
    );
};

export default NeuralBrain3D;
