import { useCallback } from 'react';

export const useMapGeometry = (svgRef) => {
    
    const getMousePos = useCallback((e) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const CTM = svgRef.current.getScreenCTM();
        if (!CTM) return { x: 0, y: 0 };
        return { x: (e.clientX - CTM.e) / CTM.a, y: (e.clientY - CTM.f) / CTM.d };
    }, [svgRef]);

    const distToSegment = useCallback((p, p1, p2) => {
        const l2 = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
        if (l2 === 0) return Math.sqrt((p.x - p1.x) * (p.x - p1.x) + (p.y - p1.y) * (p.y - p1.y));
        let t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const px = Math.round(p1.x + t * (p2.x - p1.x));
        const py = Math.round(p1.y + t * (p2.y - p1.y));
        return Math.sqrt((p.x - px) * (p.x - px) + (p.y - py) * (p.y - py));
    }, []);

    const getBilinearPos = useCallback((points, u, v) => {
        const x = (1 - u) * (1 - v) * points[0].x + u * (1 - v) * points[1].x + u * v * points[2].x + (1 - u) * v * points[3].x;
        const y = (1 - u) * (1 - v) * points[0].y + u * (1 - v) * points[1].y + u * v * points[2].y + (1 - u) * v * points[3].y;
        return { x, y };
    }, []);

    const getControlPoint = useCallback((p1, p2, amount) => {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        const nx = -dy / len; 
        const ny = dx / len;
        return { x: midX + nx * (amount || 0), y: midY + ny * (amount || 0) };
    }, []);

    const getPathData = useCallback((points, curves = []) => {
        if (!points || points.length === 0) return '';
        const curvs = curves.length > 0 ? curves : Array(points.length).fill(0);
        const pathSegments = points.map((p, idx) => {
            const nextIdx = (idx + 1) % points.length;
            const nextP = points[nextIdx];
            const c = getControlPoint(p, nextP, curvs[idx]);
            return `Q ${c.x} ${c.y} ${nextP.x} ${nextP.y}`;
        });
        return `M ${points[0].x} ${points[0].y} ` + pathSegments.join(' ') + ' Z';
    }, [getControlPoint]);

    return {
        getMousePos,
        distToSegment,
        getBilinearPos,
        getControlPoint,
        getPathData
    };
};
