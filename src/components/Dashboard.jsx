import React from 'react';
import { Layout, Image, Video, Mic, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const tools = [
        { id: 'bg-changer', title: 'Background Changer', icon: <Image size={24} />, description: 'Remove or replace backgrounds instantly.', color: '#6366f1' },
        { id: 'img-video', title: 'Image to Video', icon: <Video size={24} />, description: 'Transform static images into dynamic videos.', color: '#a855f7' },
        { id: 'txt-voice', title: 'Text to Voice', icon: <Mic size={24} />, description: 'Generate realistic voiceovers for your products.', color: '#ec4899' },
    ];

    const handleLaunch = (toolId) => {
        if (toolId === 'bg-changer') {
            navigate('/tool/background-changer');
        } else {
            alert('This tool is coming soon!');
        }
    };

    return (
        <div className="container" style={{ padding: '120px 2rem 60px' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome back to <span className="text-gradient">PicPro</span></h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>What would you like to create today?</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {tools.map((tool) => (
                    <div key={tool.id} className="glass card" style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.3s' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        onClick={() => handleLaunch(tool.id)}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            backgroundColor: tool.color + '22',
                            color: tool.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            {tool.icon}
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>{tool.title}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>{tool.description}</p>
                        <button className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%' }}>Launch Tool</button>
                    </div>
                ))}

                <div className="glass card" style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed var(--glass-border)',
                    backgroundColor: 'transparent'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '2px solid var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                        color: 'var(--text-muted)'
                    }}>
                        <Plus size={24} />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Request New Feature</p>
                </div>
            </div>

            <div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Recent Creations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="glass" style={{ aspectRatio: '1', borderRadius: '1rem', overflow: 'hidden' }}>
                            <img src={`/images/${idx === 1 ? 'perfume.png' : idx === 2 ? 'sneakers.png' : idx === 3 ? 'coffee.png' : 'perfume.png'}`}
                                alt="Creation"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
