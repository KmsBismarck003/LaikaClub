import React from 'react';
import { Lock } from 'lucide-react';
import { getImageUrl } from '../../../../utils/imageUtils';

const VisualEventPicker = ({ events, onSelect, selectedId, isPro, onUpgrade }) => (
    <div className="event-picker-horizontal">
        {events.map((ev, idx) => {
            const isLocked = false;
            return (
                <div 
                    key={ev.id} 
                    className={`event-mini-card ${selectedId === ev.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => isLocked ? onUpgrade() : onSelect(ev.id)}
                >
                    <div className="mini-card-img">
                        {isLocked ? (
                            <div className="lock-overlay-mini">
                                <Lock size={16} />
                            </div>
                        ) : (
                            <img src={getImageUrl(ev.image_url || ev.image)} alt={ev.name} />
                        )}
                    </div>
                    <span>{isLocked ? 'NIVEL PRO' : (ev.name || 'S/N').toUpperCase()}</span>
                </div>
            );
        })}
    </div>
);

export default VisualEventPicker;
