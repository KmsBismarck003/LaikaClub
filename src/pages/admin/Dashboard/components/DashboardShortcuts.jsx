import React from 'react';
import { Icon, Skeleton } from '../../../../components';

const DashboardShortcuts = ({ 
    isLoading, sections, handleDragStart, handleDragEnd, 
    handleDragOver, handleDrop, navigate 
}) => {
    return (
        <div className="dashboard-shortcuts">
            {sections.map((section) => (
                <div key={section.id} className="shortcuts-section">
                    <h3 className="section-title">
                        {isLoading ? (
                            <Skeleton width="180px" height="16px" />
                        ) : (
                            <>
                                <Icon name={section.icon} size={16} /> {section.label.toUpperCase()}
                            </>
                        )}
                    </h3>
                    <div className="shortcuts-grid">
                        {isLoading ? (
                            [...Array(section.items.length)].map((_, i) => (
                                <div key={i} className="shortcut-card" style={{ minHeight: '75px', justifyContent: 'center' }}>
                                    <Skeleton style={{ height: '14px', width: '80%', marginBottom: '8px' }} />
                                    <Skeleton style={{ height: '14px', width: '20px', alignSelf: 'flex-end' }} />
                                </div>
                            ))
                        ) : (
                            section.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="shortcut-card"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, section.id, item.id)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, section.id, item.id)}
                                    onClick={() => navigate(item.path)}
                                >
                                    <p className="shortcut-label">{item.label}</p>
                                    <div className="icon-container">
                                        <Icon name={item.icon} size={18} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardShortcuts;
