import React from 'react'
import { Dropdown, Icon, NotificationBell } from '../../components'
import './AdminNavbar.css'

const AdminNavbar = ({ 
  user, 
  getRoleTitle, 
  showSkeleton, 
  navigate, 
  handleLogout, 
  isDark, 
  toggleTheme, 
  setCustomColor, 
  customColor, 
  sidebarOnly, 
  setSidebarOnly 
}) => {
  return (
    <header className='admin-navbar glass-panel'>
      <div className='admin-navbar-left'>
        <div className='admin-title-section'>
          {showSkeleton
            ? <div className="skeleton" style={{ width: '180px', height: '22px', borderRadius: '6px' }} />
            : <h1 className='admin-title'>{getRoleTitle()}</h1>
          }
        </div>
      </div>

      <div className='admin-navbar-right'>
        <div className='notification-wrapper'>
          {showSkeleton
            ? <div className="skeleton skeleton-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            : <NotificationBell />
          }
        </div>

        {showSkeleton ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="skeleton skeleton-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            <div>
              <div className="skeleton" style={{ width: '80px', height: '11px', borderRadius: '4px', marginBottom: '5px' }} />
              <div className="skeleton" style={{ width: '55px', height: '10px', borderRadius: '4px' }} />
            </div>
          </div>
        ) : (
          <Dropdown
            trigger={
              <button className='admin-user-menu-trigger'>
                <span className='admin-user-avatar'>
                  {(user?.avatarUrl || user?.avatar_url) ? (
                    <img 
                      src={(user.avatarUrl || user.avatar_url).startsWith('http') || (user.avatarUrl || user.avatar_url).startsWith('data:')
                        ? (user.avatarUrl || user.avatar_url) 
                        : `${process.env.REACT_APP_API_HOST || 'http://localhost:8000'}${user.avatarUrl || user.avatar_url}`} 
                      alt="Avatar" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = '<div class="avatar-fallback">' + 
                          ((user?.first_name?.[0] || user?.firstName?.[0] || 'U') + 
                           (user?.last_name?.[0] || user?.lastName?.[0] || '')).toUpperCase() + 
                          '</div>';
                      }}
                    />
                  ) : (
                    <Icon name="user" size={20} />
                  )}
                </span>
                <div className='admin-user-info'>
                  <span className='admin-user-name'>
                    {user?.first_name || user?.firstName || ''}
                  </span>
                  <span className='admin-user-role'>{user?.role}</span>
                </div>
                <span className='admin-dropdown-arrow'>
                  <Icon name="chevronDown" size={16} />
                </span>
              </button>
            }
            align='right'
          >
            <Dropdown.Item icon={<Icon name="user" size={16} />} onClick={() => navigate('/profile')}>
              Mi Perfil
            </Dropdown.Item>
            <Dropdown.Item icon={<Icon name="settings" size={16} />} onClick={() => navigate('/settings')}>
              Configuración
            </Dropdown.Item>

            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>Modo Oscuro</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '34px', height: '18px' }}>
                  <input 
                    type="checkbox" 
                    checked={isDark} 
                    onChange={toggleTheme} 
                    style={{ opacity: 0, width: 0, height: 0 }} 
                  />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isDark ? '#10b981' : '#ccc', transition: '.4s', borderRadius: '20px' }}>
                    <span style={{ position: 'absolute', content: '""', height: '12px', width: '12px', left: isDark ? '18px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                  </span>
                </label>
              </div>
              {isDark && (
                <>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <button onClick={() => setCustomColor('default')} style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#121212', border: customColor==='default'?'2px solid #fff':'1px solid #ccc', cursor: 'pointer' }} title="Default Dark" />
                    <button onClick={() => setCustomColor('github')} style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#0d1117', border: customColor==='github'?'2px solid #fff':'1px solid #ccc', cursor: 'pointer' }} title="GitHub Dark" />
                    <button onClick={() => setCustomColor('charcoal')} style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#1b1e23', border: customColor==='charcoal'?'2px solid #fff':'1px solid #ccc', cursor: 'pointer' }} title="Charcoal" />
                    <button onClick={() => setCustomColor('midnight')} style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#050505', border: customColor==='midnight'?'2px solid #fff':'1px solid #ccc', cursor: 'pointer' }} title="Midnight" />
                    <button onClick={() => setCustomColor('grey')} style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#2b2b2b', border: customColor==='grey'?'2px solid #fff':'1px solid #ccc', cursor: 'pointer' }} title="Gris Premium" />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <input 
                      type="checkbox" 
                      id="sidebarOnly-toggle-admin"
                      checked={sidebarOnly} 
                      onChange={(e) => setSidebarOnly(e.target.checked)} 
                      style={{ cursor: 'pointer', margin: 0 }}
                    />
                    <label htmlFor="sidebarOnly-toggle-admin" style={{ fontSize: '0.72rem', color: '#FFFFFF', cursor: 'pointer', userSelect: 'none' }}>
                      Solo barras de navegación
                    </label>
                  </div>
                </>
              )}
            </div>

            <Dropdown.Divider />
            <Dropdown.Item icon={<Icon name="logout" size={16} />} danger onClick={handleLogout}>
              Cerrar Sesión
            </Dropdown.Item>
          </Dropdown>
        )}
      </div>
    </header>
  )
}

export default AdminNavbar
