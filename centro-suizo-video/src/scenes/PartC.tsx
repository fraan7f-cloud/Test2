import React from 'react';
import {Img, staticFile} from 'remotion';
import {Burst, Chip, Sparkles} from '../components/Fx';
import {ShinyLogo} from '../components/LogoBug';
import {Halo, Place, Rays, RingAt} from '../components/Place';
import {SceneShell} from '../components/SceneShell';
import {GlintAbs} from '../gfx/Glint';
import {Heart, PaperPlane, Pin, Receipt, RingBox} from '../gfx/Props';
import {rand} from '../gfx/util';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, map, prog, pulse, spr, useGlobalTime, wobble} from '../lib/anim';
import {SANS, SCRIPT, SERIF} from '../lib/fonts';
import {at} from '../lib/timeline';

type SceneProps = {start: number; end: number};

/* ------------------------------------------------------------------ */
/* 9. "Así, lo que brilla es el anillo, no la cuenta."                 */
/* ------------------------------------------------------------------ */
export const Brilla: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const cx = 540;
	const cy = 1120;
	const enter = spr(t, start, {damping: 11, stiffness: 110});
	const shineT = at('brilla');
	const shine = prog(t, shineT - 0.1, 0.4);
	const cuentaT = at('cuenta');
	const rIn = spr(t, cuentaT - 0.55, {damping: 11, stiffness: 120});
	const crumple = prog(t, cuentaT + 0.15, 0.3, EASE_OUT);
	const away = prog(t, cuentaT + 0.45, 0.45, EASE_IN);
	return (
		<SceneShell t={t} start={start} end={end} enter="zoom" exit="zoom">
			<Rays x={cx} y={cy - 160} t={t} size={1500} amount={0.4 + shine * 0.6} />
			<Halo x={cx} y={cy - 160} size={1000} amount={0.5 + shine * 0.5} />
			<RingAt x={cx} y={cy + wobble(t, 2, 0.8) * 14} width={640} t={t} scale={enter * (1 + 0.06 * pulse(t, shineT + 0.05, 0.1, 0.5))} rotate={wobble(t, 6, 0.6) * 4} seed={11} />
			<GlintAbs x={cx + 40} y={cy - 330} size={170} amount={pulse(t, shineT + 0.05, 0.12, 0.6)} />
			<Burst x={cx} y={cy - 300} t={t} t0={shineT} size={500} />
			<Sparkles x={cx} y={cy - 200} t={t} radius={430} count={12} seed={4} amount={0.6 + shine * 0.4} />
			{rIn > 0.001 ? (
				<Place
					x={830 + (1 - Math.min(1, rIn)) * 500 + away * 600}
					y={1430 + away * 700}
					rotate={-14 + (1 - Math.min(1, rIn)) * 40 + away * 260}
					scale={1 - away * 0.5}
					opacity={1 - away}
				>
					<div style={{filter: `grayscale(${crumple}) brightness(${1 - crumple * 0.25})`}}>
						<Receipt width={230} crumple={crumple} />
					</div>
				</Place>
			) : null}
			<Chip x={830} y={1230} t={t} t0={cuentaT + 0.1} t1={cuentaT + 0.6} variant="bad" size={44}>
				✗
			</Chip>
		</SceneShell>
	);
};

/* ------------------------------------------------------------------ */
/* 10. "Si conoces a alguien ... mándale este video."                  */
/* ------------------------------------------------------------------ */
const Check: React.FC<{color: string}> = ({color}) => (
	<svg width={46} height={26} viewBox="0 0 46 26">
		<path d="M2,14 L10,22 L26,4" stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		<path d="M18,22 L20,22 L38,4" stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const RingIcon: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{verticalAlign: 'middle'}}>
		<circle cx={50} cy={62} r={30} fill="none" stroke="#F3C969" strokeWidth={9} />
		<path d="M38,30 L50,14 L62,30 L50,40 Z" fill="#cfe0ff" stroke="#fff" strokeWidth={2} />
	</svg>
);

export const Cta: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const phoneIn = spr(t, start + 0.02, {damping: 13, stiffness: 100});
	const W = 560;
	const H = 940;
	const cx = 540;
	const top = 640;
	const avatar = spr(t, at('alguien') - 0.1, {damping: 9, stiffness: 200});
	const bubbleIn = spr(t, at('pedir') - 0.1, {damping: 12, stiffness: 160});
	const videoIn = spr(t, at('mándale') - 0.05, {damping: 12, stiffness: 150});
	const send = prog(t, at('video') - 0.05, 0.75, EASE_IN);
	const checks = prog(t, at('video') + 0.35, 0.2);
	const hearts = prog(t, at('matrimonio'), 3.5);
	return (
		<SceneShell t={t} start={start} end={end} enter="slideUp" exit="zoom" push={0.03}>
			<Halo x={cx} y={1100} size={1100} amount={0.45} color="255,143,184" />
			{/* corazones flotando */}
			{hearts > 0
				? Array.from({length: 9}, (_, i) => {
						const ph = (hearts * 2.2 + rand(i * 3)) % 1;
						const x = 120 + rand(i * 5.1) * 840 + Math.sin(t * 2 + i) * 30;
						const y = 1650 - ph * 1100;
						return (
							<div key={i} style={{position: 'absolute', left: x, top: y, opacity: Math.sin(Math.PI * ph) * 0.9, scale: String(0.6 + rand(i) * 0.8), rotate: `${Math.sin(t * 3 + i) * 15}deg`}}>
								<Heart size={60} color={i % 3 ? '#ff5c8a' : '#F3C969'} />
							</div>
						);
					})
				: null}
			<div
				style={{
					position: 'absolute',
					left: cx - W / 2,
					top,
					width: W,
					height: H,
					translate: `0px ${(1 - phoneIn) * 1300}px`,
					rotate: `${(1 - phoneIn) * 12 + wobble(t, 3, 0.5) * 1.5}deg`,
					borderRadius: 70,
					background: 'linear-gradient(145deg,#2a2f45,#0c0e18)',
					padding: 18,
					boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 3px rgba(255,255,255,0.12), 0 0 60px rgba(255,143,184,0.25)',
				}}
			>
				<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 54, overflow: 'hidden', background: 'linear-gradient(180deg,#141a3f 0%,#1d1440 100%)'}}>
					{/* cabecera */}
					<div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '64px 28px 22px', background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
						<div
							style={{
								width: 76,
								height: 76,
								borderRadius: 38,
								background: 'linear-gradient(135deg,#ff8fb8,#8f7bff)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								scale: String(avatar),
								boxShadow: '0 0 20px rgba(255,143,184,0.6)',
							}}
						>
							<Heart size={40} color="#fff" />
						</div>
						<div style={{fontFamily: SANS, color: '#fff', opacity: Math.min(1, avatar)}}>
							<div style={{fontWeight: 800, fontSize: 32}}>Tu amigo</div>
							<div style={{fontWeight: 600, fontSize: 22, color: '#3DDC84'}}>en línea</div>
						</div>
					</div>
					{/* mensaje recibido */}
					<div
						style={{
							position: 'absolute',
							left: 26,
							top: 210,
							maxWidth: 440,
							padding: '20px 24px',
							borderRadius: '26px 26px 26px 6px',
							background: 'rgba(255,255,255,0.14)',
							fontFamily: SANS,
							fontWeight: 600,
							fontSize: 36,
							lineHeight: 1.3,
							color: '#fff',
							transformOrigin: '0% 100%',
							scale: String(bubbleIn),
							opacity: Math.min(1, bubbleIn * 2),
						}}
					>
						Estoy pensando en pedir matrimonio <RingIcon size={50} />
					</div>
					{/* video enviado */}
					<div
						style={{
							position: 'absolute',
							right: 26,
							top: 400,
							width: 330,
							borderRadius: '26px 26px 6px 26px',
							padding: 12,
							background: 'linear-gradient(135deg,#F3C969,#c8902a)',
							transformOrigin: '100% 100%',
							scale: String(videoIn),
							opacity: Math.min(1, videoIn * 2),
							boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
						}}
					>
						<div style={{position: 'relative', height: 200, borderRadius: 18, overflow: 'hidden', background: 'radial-gradient(circle at 50% 40%, #2b3590, #0b1033)'}}>
							<Img src={staticFile('img/logo-centro-suizo.png')} style={{position: 'absolute', left: 75, top: 26, width: 160}} />
							<div style={{position: 'absolute', left: '50%', top: '62%', translate: '-50% -50%', width: 70, height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<svg width={30} height={30} viewBox="0 0 30 30">
									<path d="M8,4 L26,15 L8,26 Z" fill="#141a4a" />
								</svg>
							</div>
						</div>
						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 6px 2px', fontFamily: SANS, fontWeight: 800, fontSize: 24, color: '#141a4a'}}>
							<span>Mira este video</span>
							<span style={{opacity: checks}}>
								<Check color="#1d4ed8" />
							</span>
						</div>
					</div>
					{/* barra de escribir */}
					<div style={{position: 'absolute', left: 20, right: 20, bottom: 26, height: 84, borderRadius: 42, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10}}>
						<div
							style={{
								width: 66,
								height: 66,
								borderRadius: 33,
								background: 'linear-gradient(135deg,#F3C969,#c8902a)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								scale: String(1 + 0.25 * pulse(t, at('video') - 0.05, 0.08, 0.25)),
							}}
						>
							<PaperPlane size={36} />
						</div>
					</div>
				</div>
			</div>
			{/* avión de papel saliendo */}
			{send > 0 && send < 1 ? (
				<>
					<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
						<path
							d={`M${cx + W / 2 - 70},${top + H - 70} Q${cx + 200},${top + 300} ${1150},${300}`}
							fill="none"
							stroke="rgba(255,255,255,0.6)"
							strokeWidth={5}
							strokeDasharray="14 14"
							pathLength={1}
							strokeDashoffset={0}
							style={{clipPath: 'none'}}
							opacity={Math.sin(Math.PI * send)}
						/>
					</svg>
					<Place
						x={(1 - send) ** 2 * (cx + W / 2 - 70) + 2 * (1 - send) * send * (cx + 200) + send ** 2 * 1150}
						y={(1 - send) ** 2 * (top + H - 70) + 2 * (1 - send) * send * (top + 300) + send ** 2 * 300}
						rotate={-20 + send * 10}
						scale={1 + send}
					>
						<PaperPlane size={110} />
					</Place>
				</>
			) : null}
		</SceneShell>
	);
};

/* ------------------------------------------------------------------ */
/* 11. "¡Centro Suizo podría ser parte de su historia!"                */
/* ------------------------------------------------------------------ */
export const Historia: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const open = prog(t, start + 0.15, 0.45, EASE_OUT);
	const glow = pulse(t, start + 0.45, 0.15, 1.2);
	const logo = spr(t, at('Centro') + 0.05, {damping: 12, stiffness: 110});
	const hT = at('historia');
	const hearts = prog(t, hT - 0.1, 2.2);
	return (
		<SceneShell t={t} start={start} end={end} enter="zoom" exit="zoom" push={0.05}>
			<Rays x={540} y={1100} t={t} size={1700} amount={open} />
			<Halo x={540} y={1000} size={1200} amount={open * 0.9} />
			<Place x={540} y={1290} scale={0.85 + 0.15 * spr(t, start, {damping: 12})}>
				<RingBox width={500} t={t} open={open} ringRise={spr(t, start + 0.4, {damping: 9})} glow={glow} />
			</Place>
			<Place x={540} y={map(logo, 0, 1, 1000, 790)} scale={Math.min(1.1, logo)} opacity={Math.min(1, logo * 2)}>
				<ShinyLogo width={540} t={t - at('Centro')} shineEvery={2.6} glow={1} />
			</Place>
			<Burst x={540} y={790} t={t} t0={at('Centro') + 0.05} size={600} />
			<Sparkles x={540} y={1000} t={t} radius={520} count={16} seed={12} amount={open} />
			{hearts > 0
				? Array.from({length: 10}, (_, i) => {
						const a = (i / 10) * Math.PI * 2;
						const d = 200 + hearts * 380;
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: 540 + Math.cos(a) * d - 30,
									top: 1050 + Math.sin(a) * d * 0.8 - 30,
									opacity: Math.sin(Math.PI * Math.min(1, hearts * 1.2)),
									scale: String(0.7 + 0.5 * Math.sin(t * 6 + i)),
								}}
							>
								<Heart size={60} color={i % 2 ? '#ff5c8a' : '#F3C969'} />
							</div>
						);
					})
				: null}
		</SceneShell>
	);
};

/* ------------------------------------------------------------------ */
/* 12. Cierre: logo + sucursal Arturo Prat 478                         */
/* ------------------------------------------------------------------ */
export const Outro: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const logo = spr(t, start, {damping: 13, stiffness: 120});
	const card = spr(t, start + 0.15, {damping: 14, stiffness: 90});
	const pin = spr(t, start + 0.55, {damping: 7, stiffness: 160});
	const suc = spr(t, start + 0.7, {damping: 12, stiffness: 140});
	const addr = prog(t, start + 0.85, 0.6, EASE_OUT);
	const tag = prog(t, start + 1.4, 0.5);
	const kb = map(t, start, end, 1.0, 1.12, EASE_IN_OUT);
	const sweep = map(t, start + 1.0, start + 2.0, -40, 140);
	const cardTop = 560;
	const cardW = 900;
	const cardH = 600;
	return (
		<SceneShell t={t} start={start} end={end + 1} enter="zoom" exit="none" push={0.02}>
			<Halo x={540} y={330} size={900} amount={logo * 0.6} />
			<Place x={540} y={330} scale={0.6 + 0.4 * logo} opacity={Math.min(1, logo * 2)}>
				<ShinyLogo width={430} t={t - start} shineEvery={2.4} glow={1} />
			</Place>
			{/* foto de la sucursal */}
			<div
				style={{
					position: 'absolute',
					left: 540 - cardW / 2,
					top: cardTop,
					width: cardW,
					height: cardH,
					borderRadius: 34,
					overflow: 'hidden',
					border: '5px solid #F3C969',
					boxShadow: '0 30px 70px rgba(0,0,0,0.6), 0 0 50px rgba(243,201,105,0.35)',
					transform: `perspective(1400px) rotateX(${(1 - card) * 35}deg) translateY(${(1 - card) * 400}px)`,
					opacity: Math.min(1, card * 2),
				}}
			>
				<Img src={staticFile('img/sucursal-arturo-prat.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', scale: String(kb), transformOrigin: '45% 40%'}} />
				<div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${sweep - 12}%, rgba(255,240,200,0.45) ${sweep}%, transparent ${sweep + 12}%)`}} />
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(5,7,26,0.55))'}} />
			</div>
			<Place x={540 + 330} y={cardTop - 10 + (1 - Math.min(1, pin)) * -400} scale={Math.min(1, pin * 1.5)} anchorY="-100%">
				<Pin size={110} />
			</Place>
			<Burst x={870} y={cardTop + 10} t={t} t0={start + 0.75} size={260} />
			{/* textos */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: cardTop + cardH + 70,
					textAlign: 'center',
					fontFamily: SERIF,
					fontWeight: 700,
					fontSize: 46,
					letterSpacing: 14,
					color: '#F3C969',
					opacity: Math.min(1, suc),
					translate: `0px ${(1 - Math.min(1, suc)) * 40}px`,
				}}
			>
				SUCURSAL
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: cardTop + cardH + 130,
					textAlign: 'center',
					fontFamily: SERIF,
					fontWeight: 700,
					fontSize: 100,
					lineHeight: 1.1,
					color: '#ffffff',
					clipPath: `inset(0 ${(1 - addr) * 100}% 0 0)`,
					textShadow: '0 0 30px rgba(255,227,154,0.45), 0 6px 18px rgba(0,0,0,0.5)',
					whiteSpace: 'nowrap',
				}}
			>
				Arturo Prat 478
			</div>
			<div
				style={{
					position: 'absolute',
					left: 540 - 260 * addr,
					top: cardTop + cardH + 262,
					width: 520 * addr,
					height: 3,
					background: 'linear-gradient(90deg, transparent, #F3C969, transparent)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: cardTop + cardH + 290,
					textAlign: 'center',
					fontFamily: SCRIPT,
					fontStyle: 'italic',
					fontWeight: 600,
					fontSize: 72,
					color: '#F3C969',
					opacity: tag,
					translate: `0px ${(1 - tag) * 30}px`,
				}}
			>
				Te esperamos
			</div>
			<Sparkles x={540} y={900} t={t} radius={560} count={14} seed={21} amount={Math.min(1, card)} />
		</SceneShell>
	);
};

