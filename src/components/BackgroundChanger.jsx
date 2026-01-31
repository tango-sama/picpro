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

    const canvasContainerRef = useRef(null);

    const [cursorVisible, setCursorVisible] = useState(false);
    const cursorRef = useRef(null);

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

            // Set dimensions for both
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;

            // 1. Draw original image on BACK layer (canvasRef)
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 2. Clear FRONT layer (maskCanvasRef) -> Transparent
            const maskCtx = maskCanvas.getContext('2d');
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        }
    }, [imageLoaded]);

    const updateBrushSize = (e) => {
        const newSize = parseInt(e.target.value);
        setBrushSize(newSize);
        setCursorVisible(true);
        // Hide cursor after a delay if not drawing/moving?
        // Actually, just showing it is fine. It renders at (0,0) if we don't have a position?
        // We need a position for the cursor preview if user is just sliding the slider!
        // We can temporarily center it or keep last known pos.
        // Let's default to center of screen or keep last `cursorRef` position?
        // The `cursorRef` has `style.transform` set by `updateCursor`.
        // If we haven't moved mouse yet, it might be at 0,0.
        // Let's assume user is looking at the canvas.

        // Better: Show a "Preview" circle in the center of the canvas container if not interacting?
        // Or just let it be.
    };

    // ...

    // Correct Touch/Mouse coordinate mapping for Zoomed/Panned Canvas
    // We forcing transformOrigin to '0 0' simplifies the logic significantly.
    const getPointerPos = (e) => {
        const canvas = maskCanvasRef.current;
        if (!canvas) return { x: 0, y: 0, cursorX: 0, cursorY: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Raw distance from top-left of the TRANSFORMED element
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;



        // 1. Drawing Coordinates (Internal Canvas Pixels)
        // Map visual pixels -> Internal pixels
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const drawX = offsetX * scaleX;
        const drawY = offsetY * scaleY;

        // 2. Cursor Coordinates (CSS Layout Pixels)
        // The cursor is inside the transformed wrapper.
        // We need the coordinate in the wrapper's "local" space (unscaled).
        // Since rect includes the scale, we divide by scale.
        const cursorX = offsetX / transform.scale;
        const cursorY = offsetY / transform.scale;

        return {
            x: drawX,
            y: drawY,
            cursorX,
            cursorY
        };
    };

    // Update cursor element position
    const updateCursor = (e) => {
        if (!cursorRef.current || !maskCanvasRef.current) return;
        const { cursorX, cursorY } = getPointerPos(e); // Use CSS Coordinates
        cursorRef.current.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    };

    const handleEnter = () => setCursorVisible(true);
    const handleLeave = () => {
        setCursorVisible(false);
        setIsDrawing(false);
    };

    const startDrawing = (e) => {
        e.preventDefault();
        setCursorVisible(true); // Ensure cursor is visible on touch start
        setIsDrawing(true);
        updateCursor(e); // Snap cursor to touch point immediately
        draw(e);
    };



    const stopDrawing = () => {
        setIsDrawing(false);
        const maskCtx = maskCanvasRef.current?.getContext('2d');
        if (maskCtx) maskCtx.beginPath();
    };

    const handleMove = (e) => {
        e.preventDefault();
        if (!imageLoaded) return;
        setCursorVisible(true); // Ensure cursor is visible during move
        updateCursor(e);
        if (isDrawing) {
            draw(e);
        }
    };

    const draw = (e) => {
        if (!isDrawing || !imageLoaded) return;
        const maskCanvas = maskCanvasRef.current;
        const maskCtx = maskCanvas.getContext('2d');

        const { x, y } = getPointerPos(e);

        // Draw SOLID RED on the mask canvas
        // (CSS opacity will make it look translucent, preventing overlap buildup)
        maskCtx.lineWidth = brushSize;
        maskCtx.lineCap = 'round';
        maskCtx.lineJoin = 'round';
        maskCtx.strokeStyle = '#ff0000'; // Pure red

        maskCtx.lineTo(x, y);
        maskCtx.stroke();
        maskCtx.beginPath();
        maskCtx.moveTo(x, y);
    };

    const getMaskBlob = () => {
        return new Promise((resolve) => {
            // Create a temporary canvas to compose the final black/white mask for AI
            const tempCanvas = document.createElement('canvas');
            const maskCanvas = maskCanvasRef.current;
            tempCanvas.width = maskCanvas.width;
            tempCanvas.height = maskCanvas.height;
            const ctx = tempCanvas.getContext('2d');

            // 1. Fill Black
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // 2. Draw the red mask as White
            // We use globalCompositeOperation to ensure we only draw where the red is
            ctx.globalCompositeOperation = 'source-over';

            // Draw the user's mask onto this temp canvas
            // The user's mask is Red on Transparent. 
            // We want it to become White on Black.
            // Simplest way: Draw it, then use separate compositing or just iterate pixels?
            // Easier: Re-draw the maskCanvas onto temp, but force color?
            // No, easiest: Draw maskCanvas. Then use 'source-in' with white fill?

            ctx.drawImage(maskCanvas, 0, 0);

            // Now we have Black background + Red strokes.
            // Turn Red strokes to White.
            // Composite 'source-in' with White color will turn ALL non-transparent pixels (Red + Black BG) to White.
            // Wait, Black BG is opaque.

            // BETTER APPROACH:
            // 1. Fill Black.
            // 2. Save context.
            // 3. Draw maskCanvas (Red).
            // 4. Set composite 'source-in' -> this keeps overlap of (Red) and (New Paint).
            //    This is tricky because we merged with black background already.

            // CORRECT APPROACH FOR TEMP CANVAS:
            // 1. Draw maskCanvas (Red transparent layer) onto tempCanvas ?? No.

            // Let's do this:
            // 1. Clear temp canvas.
            // 2. Draw maskCanvas. (Now we have Red on Transparent).
            // 3. GlobalCompositeOperation = 'source-in'.
            // 4. FillRect(White). (Now we have White on Transparent).
            // 5. GlobalCompositeOperation = 'destination-over'. (Draw BEHIND).
            // 6. FillRect(Black). (Now we have White on Black).

            ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            tempCanvas.toBlob(blob => resolve(blob), 'image/png');
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

    const handleClearMask = () => {
        if (!canvasRef.current || !maskCanvasRef.current || !imageRef.current) return;

        // Clear main canvas and redraw original image (remove red strokes)
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        // Reset mask canvas to black
        const maskCtx = maskCanvasRef.current.getContext('2d');
        maskCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
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
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                                    {imageLoaded ? "2. Draw a Mask (Pinch to Zoom)" : "1. Upload Product Picture (1x1)"}
                                </label>

                                {imageLoaded && (
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <Brush size={16} />
                                            <input
                                                type="range" min="5" max="50"
                                                value={brushSize}
                                                onChange={updateBrushSize}
                                                style={{ width: '100px' }}
                                                title="Brush Size"
                                            />
                                        </div>

                                        <button
                                            onClick={handleClearMask}
                                            className="btn btn-secondary"
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                gap: '0.5rem',
                                                alignItems: 'center'
                                            }}
                                        >
                                            Clear Mask
                                        </button>
                                        <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                                            Reset View
                                        </button>

                                        <button
                                            onClick={handleRemoveImage}
                                            className="btn btn-secondary"
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                gap: '0.5rem',
                                                alignItems: 'center',
                                                background: 'rgba(255, 50, 50, 0.2)',
                                                border: '1px solid rgba(255, 50, 50, 0.4)'
                                            }}
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
                                    overflow: 'hidden',
                                    touchAction: 'none' // Critical for gesture handling
                                }}
                                onMouseEnter={handleEnter}
                                onMouseLeave={handleLeave}
                                // Attach Touch Handlers to Container
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                            >
                                {!imageLoaded && (
                                    <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                        <Upload size={32} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                                        <p>Click to upload image</p>
                                    </div>
                                )}

                                {/* Transform Wrapper for Zoom/Pan */}
                                <div style={{
                                    position: 'relative',
                                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                                    transformOrigin: '0 0', // CRITICAL: Makes math simple and predictable
                                    transition: isGesturingRef.current ? 'none' : 'transform 0.1s ease-out'
                                }}>
                                    {/* Background Image Canvas - Bottom Layer */}
                                    <canvas
                                        ref={canvasRef}
                                        style={{
                                            opacity: imageLoaded ? 1 : 0,
                                            maxWidth: '100%',
                                            display: 'block', // Removes micro-gaps
                                            pointerEvents: 'none' // Pass through events if needed, but top layer catches them
                                        }}
                                    />

                                    {/* Drawing/Mask Canvas - Top Layer */}
                                    <canvas
                                        ref={maskCanvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseMove={handleMove}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        // Touch is handled by parent container to distinguish gestures
                                        style={{
                                            position: 'absolute',
                                            inset: 0, // Cover the container (or align with canvasRef explicitly if container shrinks)
                                            // Wait, container size depends on canvasRef relative size. 
                                            // Standard practice: Container fits content (canvasRef). maskCanvasRef absolute to top/left.
                                            // left: '50%', // These are now handled by the wrapper div's transform
                                            // top: '50%',
                                            // transform: 'translate(-50%, -50%)', // Center it perfectly over the image
                                            maxWidth: '100%',
                                            opacity: 0.6, // The magic "half red" density effect
                                            cursor: 'none',
                                            // touchAction: 'none', // Handled by parent container
                                            display: imageLoaded ? 'block' : 'none',
                                            zIndex: 10,
                                            width: '100%', height: '100%'
                                        }}
                                    />

                                    {/* Cursor INSIDE transform group so it stays attached to image during pan/zoom? 
                                        If we put it here, the "x,y" we calculate must be RELATIVE to this inner coordinate system.
                                        Our getPointerPos calculates exactly that (dividing by scale). 
                                        So yes, cursor should be inside.
                                     */}
                                    {imageLoaded && (
                                        <div
                                            ref={cursorRef}
                                            style={{
                                                position: 'absolute',
                                                left: 0, top: 0,
                                                width: `${brushSize}px`,
                                                height: `${brushSize}px`,
                                                borderRadius: '50%',
                                                border: '2px solid rgba(255, 0, 0, 0.8)',
                                                pointerEvents: 'none',
                                                zIndex: 1000,
                                                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                                                margin: `-${brushSize / 2}px 0 0 -${brushSize / 2}px`,
                                                display: cursorVisible ? 'block' : 'none',
                                                // Inverse scale cursor? No, user wants detail work.
                                                // If we scale the wrapper, the cursor div (inside) gets scaled too!
                                                // So a 20px cursor becomes 40px visually.
                                                // This effectively means "Brush covers same X% of image".
                                                // Good for "Zoom in to see better", brush stays relative to image.
                                                transformOrigin: 'center'
                                            }}
                                        />
                                    )}
                                </div>
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
