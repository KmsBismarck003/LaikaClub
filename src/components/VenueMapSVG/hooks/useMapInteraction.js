import { useState, useCallback, useEffect } from 'react';

export const useMapInteraction = (isEditMode, zones, onUpdateGeometry, onZoneSelect, getMousePos, distToSegment) => {
    
    // Core Interaction State
    const [draggingPoint, setDraggingPoint] = useState(null);
    const [draggingZone, setDraggingZone] = useState(null);
    const [rotatingZone, setRotatingZone] = useState(null);
    const [draggingText, setDraggingText] = useState(null);
    const [rotatingText, setRotatingText] = useState(null);
    const [draggingCurve, setDraggingCurve] = useState(null);
    const [draggingToolbar, setDraggingToolbar] = useState(false);
    
    const [alignmentGuides, setAlignmentGuides] = useState({ x: [], y: [] });
    const [toolbarPos, setToolbarPos] = useState({ x: null, y: null });
    const [editSubMode, setEditSubMode] = useState('move'); // 'points', 'curves', 'text', 'move'

    // 1. Mouse Event Handlers (Point Dragging)
    const handleMouseDownPoint = useCallback((zoneId, index) => (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        setDraggingPoint({ zoneId, index });
        if (onZoneSelect) onZoneSelect(zoneId);
    }, [isEditMode, onZoneSelect]);

    // 2. Zone Dragging & Rotating
    const handleMouseDownZone = useCallback((zoneId) => (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        const pos = getMousePos(e);
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;

        setDraggingZone({
            zoneId,
            startMousePos: pos,
            originalPoints: [...zone.points.map(p => ({ ...p }))]
        });
        
        if (onZoneSelect) onZoneSelect(zoneId);
    }, [isEditMode, zones, onZoneSelect, getMousePos]);

    const handleMouseDownRotate = useCallback((zoneId) => (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        const pos = getMousePos(e);
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;

        const centerX = zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
        const centerY = zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;

        setRotatingZone({
            zoneId,
            center: { x: centerX, y: centerY },
            startAngle: Math.atan2(pos.y - centerY, pos.x - centerX),
            originalPoints: [...zone.points.map(p => ({ ...p }))]
        });
    }, [isEditMode, zones, getMousePos]);

    // 3. Text Positioning Logic
    const handleMouseDownText = useCallback((zoneId) => (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        const pos = getMousePos(e);
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;

        setDraggingText({
            zoneId,
            startMousePos: pos,
            originalPos: { x: zone.textPos?.x || 0, y: zone.textPos?.y || 0 }
        });
        if (onZoneSelect) onZoneSelect(zoneId);
    }, [isEditMode, zones, onZoneSelect, getMousePos]);

    const handleMouseDownTextRotate = useCallback((zoneId) => (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        const pos = getMousePos(e);
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;

        const centerX = zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
        const centerY = zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;
        const tX = centerX + (zone.textPos?.x || 0);
        const tY = centerY + (zone.textPos?.y || 0);

        setRotatingText({
            zoneId,
            center: { x: tX, y: tY },
            startAngle: Math.atan2(pos.y - tY, pos.x - tX),
            originalAngle: zone.textAngle || 0
        });
    }, [isEditMode, zones, getMousePos]);

    // 4. Curve/Curvature Handling
    const handleMouseDownCurve = useCallback((zoneId, index) => (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        const pos = getMousePos(e);
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;

        setDraggingCurve({
            zoneId,
            index,
            startMousePos: pos,
            originalAmount: (zone.curveAmounts || Array(zone.points.length).fill(0))[index]
        });
        if (onZoneSelect) onZoneSelect(zoneId);
    }, [isEditMode, zones, onZoneSelect, getMousePos]);

    const handleSplitEdge = useCallback((zoneId, index) => (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        const zone = zones.find(z => z.id === zoneId);
        if (!zone || !onUpdateGeometry) return;

        const p1 = zone.points[index];
        const p2 = zone.points[(index + 1) % zone.points.length];
        const midX = Math.round((p1.x + p2.x) / 2);
        const midY = Math.round((p1.y + p2.y) / 2);

        const newPoints = [...zone.points];
        newPoints.splice(index + 1, 0, { x: midX, y: midY });

        const curves = [...(zone.curveAmounts || Array(zone.points.length).fill(0))];
        curves.splice(index + 1, 0, 0);

        onUpdateGeometry(zoneId, newPoints, zone.textPos, zone.textAngle, curves);
    }, [isEditMode, zones, onUpdateGeometry]);

    // 5. THE BRAIN: handleMouseMove (Logic Orchestrator)
    const handleMouseMove = useCallback((e) => {
        if (!isEditMode) return;
        const pos = getMousePos(e);

        if (draggingToolbar) {
            const rect = e.currentTarget.getBoundingClientRect();
            setToolbarPos({
                x: e.clientX - rect.left - draggingToolbar.offsetX,
                y: e.clientY - rect.top - draggingToolbar.offsetY
            });
            return;
        }

        if (draggingPoint) {
            const guides = { x: [], y: [] };
            const snapThreshold = 5;
            let snappedX = pos.x;
            let snappedY = pos.y;
            
            const referencePoints = [{ x: 400, y: 300 }];
            zones.forEach(z => z.points.forEach((p, idx) => {
                if (z.id === draggingPoint.zoneId && idx === draggingPoint.index) return;
                referencePoints.push(p);
            }));

            referencePoints.forEach(ref => {
                if (Math.abs(pos.x - ref.x) < snapThreshold) { snappedX = ref.x; guides.x.push(ref.x); }
                if (Math.abs(pos.y - ref.y) < snapThreshold) { snappedY = ref.y; guides.y.push(ref.y); }
            });

            setAlignmentGuides(guides);
            if (onUpdateGeometry) {
                const zone = zones.find(z => z.id === draggingPoint.zoneId);
                if (zone) {
                    const newPoints = [...zone.points];
                    newPoints[draggingPoint.index] = { x: Math.round(snappedX), y: Math.round(snappedY) };
                    onUpdateGeometry(draggingPoint.zoneId, newPoints);
                }
            }
            return;
        }

        if (draggingZone) {
            const deltaX = pos.x - draggingZone.startMousePos.x;
            const deltaY = pos.y - draggingZone.startMousePos.y;
            const guides = { x: [], y: [] };
            const snapThreshold = 6;
            let newPoints = draggingZone.originalPoints.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }));
            let globalOffsetX = 0, globalOffsetY = 0;
            
            const referencePoints = [{ x: 400, y: 300 }];
            zones.forEach(z => { if (z.id !== draggingZone.zoneId) z.points.forEach(p => referencePoints.push(p)); });
            
            newPoints.forEach(p => {
                referencePoints.forEach(ref => {
                    if (Math.abs(p.x - ref.x) < snapThreshold && globalOffsetX === 0) { globalOffsetX = ref.x - p.x; guides.x.push(ref.x); }
                    if (Math.abs(p.y - ref.y) < snapThreshold && globalOffsetY === 0) { globalOffsetY = ref.y - p.y; guides.y.push(ref.y); }
                });
            });
            
            const finalPoints = newPoints.map(p => ({ x: Math.round(p.x + globalOffsetX), y: Math.round(p.y + globalOffsetY) }));
            setAlignmentGuides(guides);
            if (onUpdateGeometry) onUpdateGeometry(draggingZone.zoneId, finalPoints);
            return;
        }

        if (rotatingZone) {
            const currentMouseAngle = Math.atan2(pos.y - rotatingZone.center.y, pos.x - rotatingZone.center.x);
            let angleDelta = currentMouseAngle - rotatingZone.startAngle;
            const snapInterval = Math.PI / 12; // 15 grados
            angleDelta = Math.round(angleDelta / snapInterval) * snapInterval;

            const cos = Math.cos(angleDelta);
            const sin = Math.sin(angleDelta);

            const finalPoints = rotatingZone.originalPoints.map(p => {
                const dx = p.x - rotatingZone.center.x;
                const dy = p.y - rotatingZone.center.y;
                return {
                    x: Math.round(rotatingZone.center.x + dx * cos - dy * sin),
                    y: Math.round(rotatingZone.center.y + dx * sin + dy * cos)
                };
            });

            if (onUpdateGeometry) onUpdateGeometry(rotatingZone.zoneId, finalPoints);
            return;
        }

        if (draggingText) {
            const deltaX = pos.x - draggingText.startMousePos.x;
            const deltaY = pos.y - draggingText.startMousePos.y;
            const zone = zones.find(z => z.id === draggingText.zoneId);
            if (zone && onUpdateGeometry) {
                const cX = zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
                const cY = zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;
                const absX = cX + draggingText.originalPos.x + deltaX;
                const absY = cY + draggingText.originalPos.y + deltaY;

                const guides = { x: [], y: [] };
                const snapThreshold = 5;
                let globalOffsetX = 0;
                let globalOffsetY = 0;

                const referencePoints = [];
                zones.forEach(z => {
                    if (z.id !== draggingText.zoneId) {
                        const zcX = z.points.reduce((sum, p) => sum + p.x, 0) / z.points.length;
                        const zcY = z.points.reduce((sum, p) => sum + p.y, 0) / z.points.length;
                        referencePoints.push({ x: zcX + (z.textPos?.x || 0), y: zcY + (z.textPos?.y || 0) });
                    }
                });

                referencePoints.forEach(ref => {
                    if (Math.abs(absX - ref.x) < snapThreshold && globalOffsetX === 0) { globalOffsetX = ref.x - absX; guides.x.push(ref.x); }
                    if (Math.abs(absY - ref.y) < snapThreshold && globalOffsetY === 0) { globalOffsetY = ref.y - absY; guides.y.push(ref.y); }
                });

                setAlignmentGuides(guides);

                onUpdateGeometry(draggingText.zoneId, zone.points, {
                    x: Math.round(draggingText.originalPos.x + deltaX + globalOffsetX),
                    y: Math.round(draggingText.originalPos.y + deltaY + globalOffsetY)
                }, zone.textAngle);
            }
            return;
        }

        if (rotatingText) {
            const currentMouseAngle = Math.atan2(pos.y - rotatingText.center.y, pos.x - rotatingText.center.x);
            const angleDelta = currentMouseAngle - rotatingText.startAngle;
            const degDelta = (angleDelta * 180) / Math.PI;
            const finalAngle = Math.round((rotatingText.originalAngle + degDelta) / 5) * 5;

            const zone = zones.find(z => z.id === rotatingText.zoneId);
            if (zone && onUpdateGeometry) {
                onUpdateGeometry(rotatingText.zoneId, zone.points, zone.textPos, finalAngle);
            }
            return;
        }

        if (draggingCurve) {
            const deltaX = pos.x - draggingCurve.startMousePos.x;
            const deltaY = pos.y - draggingCurve.startMousePos.y;
            const zone = zones.find(z => z.id === draggingCurve.zoneId);
            
            if (zone && onUpdateGeometry) {
                const curves = [...(zone.curveAmounts || Array(zone.points.length).fill(0))];
                const p1 = zone.points[draggingCurve.index];
                const p2 = zone.points[(draggingCurve.index + 1) % zone.points.length];
                
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const len = Math.sqrt(dx*dx + dy*dy) || 1;
                const nx = -dy / len; 
                const ny = dx / len;
                
                const projection = deltaX * nx + deltaY * ny;
                curves[draggingCurve.index] = Math.round(draggingCurve.originalAmount + projection);

                onUpdateGeometry(draggingCurve.zoneId, zone.points, zone.textPos, zone.textAngle, curves);
            }
        }
    }, [isEditMode, zones, onUpdateGeometry, getMousePos, draggingToolbar, draggingPoint, draggingZone, rotatingZone, draggingText, rotatingText, draggingCurve]);

    const handleMouseUp = useCallback(() => {
        setDraggingPoint(null);
        setDraggingZone(null);
        setRotatingZone(null);
        setDraggingText(null);
        setRotatingText(null);
        setDraggingCurve(null);
        setDraggingToolbar(false);
        setAlignmentGuides({ x: [], y: [] });
    }, []);

    // 6. Manual interactions (Edge Splitting)
    const handlePathClick = useCallback((zoneId) => (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        const pos = getMousePos(e);
        const zone = zones.find(z => z.id === zoneId);
        if (!zone || !onUpdateGeometry) return;

        let minDist = Infinity;
        let bestIdx = 0;
        for (let i = 0; i < zone.points.length; i++) {
            const d = distToSegment(pos, zone.points[i], zone.points[(i + 1) % zone.points.length]);
            if (d < minDist) { minDist = d; bestIdx = i; }
        }

        const newPoints = [...zone.points];
        newPoints.splice(bestIdx + 1, 0, { x: Math.round(pos.x), y: Math.round(pos.y) });

        const curves = [...(zone.curveAmounts || Array(zone.points.length).fill(0))];
        curves.splice(bestIdx + 1, 0, 0);

        onUpdateGeometry(zoneId, newPoints, zone.textPos, zone.textAngle, curves);
    }, [isEditMode, zones, onUpdateGeometry, getMousePos, distToSegment]);

    return {
        // State
        draggingPoint,
        draggingZone,
        rotatingZone,
        draggingText,
        rotatingText,
        draggingCurve,
        draggingToolbar,
        alignmentGuides,
        toolbarPos,
        editSubMode,
        
        // Setters
        setEditSubMode,
        setDraggingToolbar,
        setToolbarPos,
        
        // Handlers
        handleMouseDownPoint,
        handleMouseDownZone,
        handleMouseDownRotate,
        handleMouseDownText,
        handleMouseDownTextRotate,
        handleMouseDownCurve,
        handleSplitEdge,
        handleMouseMove,
        handleMouseUp,
        handlePathClick
    };
};
