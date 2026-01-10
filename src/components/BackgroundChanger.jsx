import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Loader2, Sparkles, Brush, Download, Trash2, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, setDoc, increment } from 'firebase/firestore';

const COST_PER_GENERATION = 15;
const INITIAL_CREDITS = 200;

const BackgroundChanger = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [runId, setRunId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [credits, setCredits] = useState(0);

    // Fetch user from custom session on mount
    useEffect(() => {
        fetch('/auth/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(async (data) => {
                if (data?.idToken) {
                    // Parse JWT to get user info
                    try {
                        const base64Url = data.idToken.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const payload = JSON.parse(window.atob(base64));
                        const userId = payload.sub;
                        setCurrentUser({ uid: userId, ...payload });

                        // Fetch or initialize credits
                        const userDocRef = doc(db, 'users', userId);
                        const userDoc = await getDoc(userDocRef);
                        if (userDoc.exists()) {
                            setCredits(userDoc.data().credits ?? INITIAL_CREDITS);
                        } else {
                            // First time user - create with initial credits
                            await setDoc(userDocRef, { credits: INITIAL_CREDITS, createdAt: serverTimestamp() });
                            setCredits(INITIAL_CREDITS);
                        }
                    } catch (e) {
                        console.error('Failed to parse token or fetch credits', e);
                    }
                }
            })
            .catch(() => setCurrentUser(null));
    }, []);
    // Canvas & Mask state
    const [imageLoaded, setImageLoaded] = useState(false);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(28); // 50% of range
    const [outputImage, setOutputImage] = useState(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);
    const canvasContainerRef = useRef(null);

    // Hidden mask canvas
    const maskCanvasRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setOutputImage(null);
            setImageLoaded(false);
            setRunId(null);

            // Load image to canvas
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    imageRef.current = img;
                    setImageLoaded(true);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleRemoveImage = () => {
        setFile(null);
        setImageLoaded(false);
        setOutputImage(null);
        setRunId(null);
        // Clear canvases
        if (canvasRef.current && maskCanvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            const maskCtx = maskCanvasRef.current.getContext('2d');
            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
        }
    };

    // Initialize canvases once image is loaded
    useEffect(() => {
        if (imageLoaded && imageRef.current && canvasRef.current && maskCanvasRef.current) {
            const canvas = canvasRef.current;
            const maskCanvas = maskCanvasRef.current;
            const img = imageRef.current;

            // Resize canvas to match image aspect ratio but fit within container
            const maxWidth = Math.min(600, window.innerWidth - 60);
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;

            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;

            // Draw original image on main canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Initialize mask canvas with black (no mask)
            const maskCtx = maskCanvasRef.current.getContext('2d');
            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        }
    }, [imageLoaded]);

    const startDrawing = (e) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        const maskCtx = maskCanvasRef.current.getContext('2d');
        maskCtx.beginPath();
    };

    const handleMouseMove = (e) => {
        if (!imageLoaded || !canvasRef.current || !canvasContainerRef.current) return;
        const container = canvasContainerRef.current;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCursorPos({ x, y });

        // Continue drawing if already drawing
        if (isDrawing) {
            draw(e);
        }
    };

    const handleMouseEnter = () => {
        setIsHoveringCanvas(true);
    };

    const handleMouseLeave = () => {
        setIsHoveringCanvas(false);
        setIsDrawing(false);
    };

    const draw = (e) => {
        if (!isDrawing || !imageLoaded) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const maskCtx = maskCanvasRef.current.getContext('2d');

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Draw visible feedback (semi-transparent red) on main canvas
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        // Draw actual white mask on hidden mask canvas
        maskCtx.lineWidth = brushSize;
        maskCtx.lineCap = 'round';
        maskCtx.strokeStyle = 'white';

        maskCtx.lineTo(x, y);
        maskCtx.stroke();
        maskCtx.beginPath();
        maskCtx.moveTo(x, y);
    };

    const getMaskBlob = () => {
        return new Promise((resolve) => {
            maskCanvasRef.current.toBlob(blob => resolve(blob), 'image/png');
        });
    };

    const pollForResults = async (runId, creationId, userId) => {
        setStatusText('Waiting for magic (this may take 20-30s)...');
        let creditsDeducted = false;
        let isCompleted = false;

        const checkStatus = async () => {
            if (isCompleted) return true; // Already done, don't process again

            try {
                const res = await fetch(`/api/run/${runId}`);
                if (!res.ok) return false;

                const data = await res.json();
                console.log('Poll:', data);

                if (data.outputs && data.outputs.length > 0) {
                    let outputUrl = null;

                    for (const output of data.outputs) {
                        // Prioritize "output_images" as requested
                        if (output.data && output.data.output_images && output.data.output_images.length > 0) {
                            outputUrl = output.data.output_images[0].url;
                            break;
                        }
                        if (output.data && output.data.images && output.data.images.length > 0) {
                            outputUrl = output.data.images[0].url;
                            break;
                        }
                    }

                    if (outputUrl) {
                        isCompleted = true; // Mark as completed to prevent re-processing

                        try {
                            // Download and save to personal storage
                            const imageRes = await fetch(outputUrl);
                            const imageBlob = await imageRes.blob();
                            const storagePath = `users/${userId}/outputs/${runId}.png`;
                            const outputRef = ref(storage, storagePath);
                            await uploadBytes(outputRef, imageBlob);
                            const downloadUrl = await getDownloadURL(outputRef);

                            setOutputImage(downloadUrl);
                            setLoading(false);
                            setStatusText('Done!');

                            if (creationId && userId) {
                                await updateDoc(doc(db, `users/${userId}/creations`, creationId), {
                                    outputUrl: downloadUrl,
                                    status: 'completed',
                                    completedAt: serverTimestamp()
                                });
                                // Credits are derived from server-side check now, no client deduction needed here.
                                // We can fetch the latest user, but the credit balance in UI might lag slightly until refresh or listener.
                                // For better UX, we can decrement local state immediately if we trust the server succeeded (it did if we are here).
                                // Actually, we already decremented local state in handleGenerate assuming success? No, let's sync it.
                                const userDoc = await getDoc(doc(db, 'users', userId));
                                if (userDoc.exists()) {
                                    setCredits(userDoc.data().credits);
                                }
                            }
                        } catch (err) {
                            console.error("Storage error:", err);
                            setOutputImage(outputUrl);
                            setLoading(false);
                            setStatusText('Done (Remote)!');
                        }
                        return true;
                    }
                } else if (data.status === 'failed') {
                    throw new Error('Generation failed.');
                }
            } catch (err) {
                console.warn("Polling status check failed", err);
            }
            return false;
        };

        const interval = setInterval(async () => {
            const done = await checkStatus();
            if (done) clearInterval(interval);
        }, 3000);
    };

    // Helper to convert file/blob to base64 data URL
    const toBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleGenerate = async () => {
        if (!file || !prompt) return;
        setLoading(true);
        setStatusText('Preparing images...');

        try {
            if (!currentUser) {
                alert('Please log in to use this feature.');
                setLoading(false);
                return;
            }

            // Server-side check handles deduction. We just optimistically check locally to save a request.
            if (credits < COST_PER_GENERATION) {
                alert(`Insufficient credits. You need ${COST_PER_GENERATION} coins but have ${credits}.`);
                setLoading(false);
                return;
            }

            const userId = currentUser.uid;

            // 1. Upload original image to TEMP folder (will be auto-cleaned)
            setStatusText('Uploading image...');
            const tempInputRef = ref(storage, `temp/${Date.now()}_${file.name}`);
            await uploadBytes(tempInputRef, file);
            const inputUrl = await getDownloadURL(tempInputRef);

            // 2. Upload mask to TEMP folder
            const maskBlob = await getMaskBlob();
            const tempMaskRef = ref(storage, `temp/${Date.now()}_mask.png`);
            await uploadBytes(tempMaskRef, maskBlob);
            const maskUrl = await getDownloadURL(tempMaskRef);

            setStatusText('Triggering AI...');

            // 3. Call backend proxy with Firebase URLs
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deployment_id: "0229e028-c785-4e35-8317-cbde43ccfa01",
                    inputs: {
                        "input_image": inputUrl,
                        "input_text": prompt,
                        "mask": maskUrl
                    }
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setRunId(data.run_id);

            // 4. Save to Firestore (metadata + inputUrl for preview)
            const creationRef = await addDoc(collection(db, `users/${userId}/creations`), {
                type: 'background-changer',
                prompt,
                inputUrl: inputUrl, // Save immediately for gallery preview
                runId: data.run_id,
                createdAt: serverTimestamp(),
                status: 'processing'
            });

            // Optimistically update local credits to reflect the cost immediately
            setCredits(prev => prev - COST_PER_GENERATION);

            pollForResults(data.run_id, creationRef.id, userId);

        } catch (error) {
            console.error(error);
            alert('Error: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '120px 2rem 60px', maxWidth: '800px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="glass" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '2rem' }}>Change Background</h2>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255, 215, 0, 0.15)',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}>
                        <Coins size={18} style={{ color: '#ffd700' }} />
                        <span style={{ fontWeight: '600', color: '#ffd700' }}>{credits}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>coins</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '2rem' }}>

                    {/* Step 1: Editor */}
                    {!outputImage && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ color: 'var(--text-muted)' }}>
                                    {imageLoaded ? "2. Draw a Mask over the Text area" : "1. Upload Product Picture (1x1)"}
                                </label>

                                {imageLoaded && (
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <Brush size={16} />
                                            <input
                                                type="range" min="5" max="50"
                                                value={brushSize}
                                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                                style={{ width: '100px' }}
                                            />
                                        </div>
                                        <button
                                            onClick={handleRemoveImage}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255, 50, 50, 0.2)', border: '1px solid rgba(255, 50, 50, 0.4)' }}
                                        >
                                            <Trash2 size={16} /> Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div
                                ref={canvasContainerRef}
                                style={{
                                    border: '2px dashed var(--glass-border)',
                                    borderRadius: '16px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    position: 'relative',
                                    background: 'rgba(0,0,0,0.2)',
                                    minHeight: '300px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                {!imageLoaded && (
                                    <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                        <Upload size={32} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                                        <p>Click to upload image</p>
                                    </div>
                                )}

                                <canvas ref={maskCanvasRef} style={{ display: 'none' }} />

                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    style={{
                                        opacity: imageLoaded ? 1 : 0,
                                        cursor: 'crosshair',
                                        maxWidth: '100%',
                                        touchAction: 'none'
                                    }}
                                />

                                {imageLoaded && isHoveringCanvas && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: `${cursorPos.x}px`,
                                            top: `${cursorPos.y}px`,
                                            width: `${brushSize}px`,
                                            height: `${brushSize}px`,
                                            borderRadius: '50%',
                                            border: '2px solid rgba(255, 255, 255, 0.9)',
                                            pointerEvents: 'none',
                                            transform: 'translate(-50%, -50%)',
                                            zIndex: 1000,
                                            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.6), 0 0 12px rgba(255, 255, 255, 0.4)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                        }}
                                    />
                                )}
                            </div>
                            {imageLoaded && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>Draw over the area you want to KEEP.</p>}
                        </div>
                    )}

                    {/* Output Display */}
                    {outputImage && (
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Your Magic Result</h3>
                            <div className="glass" style={{ padding: '1rem', display: 'inline-block', marginBottom: '1rem' }}>
                                <img src={outputImage} alt="Generated" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <a href={outputImage} download target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Download size={20} /> Download
                                </a>
                                <button className="btn btn-secondary" onClick={() => { setOutputImage(null); setImageLoaded(false); setFile(null); }} style={{ marginLeft: '1rem' }}>
                                    Start Over
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Prompt & Action */}
                    {!outputImage && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                                {imageLoaded ? "3. Describe New Background" : "2. Describe New Background"}
                            </label>
                            <textarea
                                className="glass-input"
                                rows="3"
                                placeholder="e.g., A minimalist marble table with sunlight..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white'
                                }}
                            />

                            <button
                                className="btn btn-primary"
                                onClick={handleGenerate}
                                disabled={loading || !file || !prompt}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    marginTop: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    fontSize: '1.1rem'
                                }}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={24} />}
                                {loading ? statusText || 'Processing...' : 'Generate Magic'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BackgroundChanger;
