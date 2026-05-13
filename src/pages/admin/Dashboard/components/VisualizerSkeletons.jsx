import React from 'react';
import Card from '../../../../components/Card/Card';
import Skeleton from '../../../../components/Skeleton/Skeleton';

const VisualizerSkeletons = () => {
    return (
        <div className="analytics-premium">
            {/* CABECERA PREMIUM MOCK */}
            <header style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)', 
                backdropFilter: 'blur(20px)', 
                borderRadius: '24px', 
                padding: '1.2rem 2rem', 
                marginBottom: '1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Skeleton style={{ height: '48px', width: '48px', borderRadius: '16px' }} />
                    <div>
                        <Skeleton style={{ height: '22px', width: '180px', marginBottom: '6px' }} />
                        <Skeleton style={{ height: '12px', width: '250px' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <Skeleton style={{ height: '30px', width: '120px', borderRadius: '12px' }} />
                        <Skeleton style={{ height: '30px', width: '100px', borderRadius: '12px' }} />
                        <Skeleton style={{ height: '30px', width: '140px', borderRadius: '12px' }} />
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.06)' }}></div>
                    <div>
                        <Skeleton style={{ height: '10px', width: '80px', marginBottom: '4px' }} />
                        <Skeleton style={{ height: '35px', width: '160px', borderRadius: '12px' }} />
                    </div>
                    <Skeleton style={{ height: '38px', width: '120px', borderRadius: '12px' }} />
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 300px) 1fr minmax(260px, 280px)', gap: '1.5rem' }}>
                {/* PANEL IZQUIERDO MOCK */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <Skeleton style={{ height: '16px', width: '16px', borderRadius: '3px' }} />
                            <Skeleton style={{ height: '14px', width: '120px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {[2, 1, 1, 1, 1, 2, 1].map((items, i) => (
                                <div key={i}>
                                    <Skeleton style={{ height: '8px', width: '40%', marginBottom: '6px' }} />
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {[...Array(items)].map((_, j) => (
                                            <Skeleton key={j} style={{ height: '35px', flex: 1, borderRadius: '12px' }} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <Skeleton style={{ height: '38px', width: '100%', borderRadius: '12px', marginTop: '0.5rem' }} />
                            <Skeleton style={{ height: '38px', width: '100%', borderRadius: '12px', background: '#e2f5e9' }} />
                        </div>
                    </Card>
                </aside>

                {/* PANEL CENTRAL MOCK */}
                <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ padding: 0, overflow: 'hidden', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
                        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Skeleton style={{ height: '16px', width: '16px', borderRadius: '4px' }} />
                                <Skeleton style={{ height: '14px', width: '180px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Skeleton style={{ height: '12px', width: '100px' }} />
                                <Skeleton style={{ height: '12px', width: '80px' }} />
                            </div>
                        </div>
                        <div style={{ height: '520px', background: '#0e0e0e', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '12px', padding: '40px' }}>
                            {[80, 140, 220, 180, 260, 190, 310, 240, 160, 110, 80].map((h, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                    <Skeleton style={{ height: `${h}px`, width: '100%', borderRadius: '8px 8px 4px 4px', background: 'var(--pearl-highlight)' }} />
                                    <Skeleton style={{ height: '6px', width: '60%', marginTop: '8px', background: 'var(--pearl-highlight)' }} />
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
                        <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)', height: '150px' }}>
                            <Skeleton style={{ height: '10px', width: '120px', marginBottom: '12px' }} />
                            <Skeleton style={{ height: '28px', width: '80%', marginBottom: '12px' }} />
                            <Skeleton style={{ height: '12px', width: '100%', marginBottom: '8px' }} />
                            <Skeleton style={{ height: '12px', width: '60%' }} />
                        </Card>
                        <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)', height: '150px' }}>
                            <Skeleton style={{ height: '10px', width: '140px', marginBottom: '12px' }} />
                            <Skeleton style={{ height: '42px', width: '60%', marginBottom: '16px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                                <Skeleton style={{ height: '12px', width: '120px' }} />
                                <Skeleton style={{ height: '14px', width: '60px', borderRadius: '6px' }} />
                            </div>
                        </Card>
                    </div>
                </main>

                {/* PANEL DERECHO MOCK */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <Skeleton style={{ height: '16px', width: '16px', borderRadius: '4px' }} />
                            <Skeleton style={{ height: '14px', width: '130px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Skeleton style={{ height: '8px', width: '50%' }} />
                                        <Skeleton style={{ height: '8px', width: '20px' }} />
                                    </div>
                                    <Skeleton style={{ height: '6px', width: '100%', borderRadius: '3px' }} />
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card style={{ padding: 0, borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.2rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Skeleton style={{ height: '14px', width: '14px', borderRadius: '3px' }} />
                            <Skeleton style={{ height: '12px', width: '150px' }} />
                        </div>
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Skeleton style={{ height: '12px', width: '18px' }} />
                                    <Skeleton style={{ height: '12px', flex: 1 }} />
                                    <Skeleton style={{ height: '12px', width: '50px' }} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
};

export default VisualizerSkeletons;
