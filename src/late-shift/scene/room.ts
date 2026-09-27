import {
	placement,
	transformPoint,
	type PlaceId,
	type Placement
} from './layouts'
import { coverage, pick, type Ink, type Tri } from './math'
import { getRoomObject, type ObjectId } from './objects'
import { drawBooks, drawLamp, drawMug, drawRadio } from './objects/deskItems'
import drawLaptop from './objects/laptop'
import drawPhone from './objects/phone'
import { drawCamera, drawFootball, drawShelf } from './objects/shelf'
import { drawPoster, drawStickies } from './objects/wallArt'
import drawWindow from './objects/window'
import { own, radialGlow } from './paint'
import type { RoomRenderState, SceneFrame } from './state'

const DRAWERS: Readonly<Record<ObjectId, (frame: SceneFrame) => void>> = {
	contact: drawWindow,
	screendle: drawPoster,
	candice: drawStickies,
	about: drawCamera,
	football: drawFootball,
	radio: drawRadio,
	skills: drawBooks,
	experience: drawLaptop,
	android: drawPhone
}

const GLOW_LIFT: Readonly<Record<Ink, number>> = { y: 0, p: 0.3, b: 0.8 }

function applyPlacement(g: CanvasRenderingContext2D, p: Placement): void {
	g.translate(p.x, p.y)
	g.scale(p.s, p.s)
	g.translate(-p.ox, -p.oy)
}

function placed(
	frame: SceneFrame,
	id: PlaceId,
	draw: (frame: SceneFrame) => void
): void {
	frame.g.save()
	applyPlacement(frame.g, placement(frame.state.layout, id))
	draw(frame)
	frame.g.restore()
}

function drawObject(frame: SceneFrame, id: ObjectId): void {
	const { g, t, ink, state } = frame
	const lift = state.hover[id] ?? 0
	const [x, y, w, h] = getRoomObject(id).box
	g.save()
	applyPlacement(g, placement(state.layout, id))
	if (lift > 0.001) {
		const cx = x + w / 2
		const cy = y + h / 2
		if (ink === 'y') {
			g.fillStyle = radialGlow(g, [cx, cy], Math.max(w, h) * 0.8, 0.55 * lift)
			g.fillRect(x - w, y - h, w * 3, h * 3)
		}
		const grow = 1 + 0.035 * lift
		g.translate(cx, cy - 4 * lift)
		g.scale(grow, grow)
		g.translate(-cx, -cy)
	}
	DRAWERS[id](frame)
	if (lift > 0.001 && ink === 'p') {
		g.setLineDash([7, 5])
		g.lineDashOffset = -t * 30
		g.lineWidth = 2.2
		g.strokeStyle = coverage(0.95 * lift)
		g.beginPath()
		g.roundRect(x - 7, y - 7, w + 14, h + 14, 8)
		g.stroke()
		g.setLineDash([])
	}
	g.restore()
}

function drawWall({ g, k, state }: SceneFrame): void {
	const { vw, vh, deskY } = state.layout
	own(g, c => c.rect(0, 0, vw, vh), k(state.tod.wall))
	for (let x = 0; x < vw; x += 34)
		own(g, c => c.rect(x, 0, 12, deskY), k(state.tod.wall) * 1.12)
}

function drawDesk({ g, k, state }: SceneFrame): void {
	const { vw, vh, deskY } = state.layout
	own(g, c => c.rect(0, deskY, vw, vh - deskY), k([0.22, 0.46, 0.3]))
	for (let y = deskY + 16; y < vh; y += 22)
		own(g, c => c.rect(0, y, vw, 2), k([0.3, 0.75, 0.4]))
	own(g, c => c.rect(0, deskY, vw, 5), k([0.25, 0.75, 0.55]))
}

function drawLampGlow({ g, ink, state }: SceneFrame): void {
	const { layout, tod } = state
	const centre = transformPoint(layout, 'lamp', [905, 312])
	const radius = 420 * placement(layout, 'lamp').s
	g.save()
	g.globalCompositeOperation = 'destination-out'
	g.fillStyle = radialGlow(g, centre, radius, GLOW_LIFT[ink] * tod.lamp)
	g.fillRect(0, 0, layout.vw, layout.vh)
	g.restore()
	if (ink === 'y') {
		g.fillStyle = radialGlow(g, centre, radius, 0.7 * tod.lamp)
		g.fillRect(0, 0, layout.vw, layout.vh)
	}
}

export function drawRoom(
	ink: Ink,
	g: CanvasRenderingContext2D,
	t: number,
	state: RoomRenderState
): void {
	const frame: SceneFrame = {
		g,
		t,
		ink,
		k: (tri: Tri) => pick(ink, tri),
		state
	}
	const { layout, camera } = state
	g.save()
	g.translate(layout.vw / 2, layout.vh / 2)
	g.scale(camera.scale, camera.scale)
	g.translate(-camera.fx, -camera.fy)
	drawWall(frame)
	for (const id of ['screendle', 'candice', 'contact'] as const)
		drawObject(frame, id)
	drawDesk(frame)
	drawLampGlow(frame)
	placed(frame, 'shelf', drawShelf)
	for (const id of ['about', 'football', 'radio'] as const)
		drawObject(frame, id)
	placed(frame, 'mug', drawMug)
	for (const id of ['skills', 'experience', 'android'] as const)
		drawObject(frame, id)
	placed(frame, 'lamp', drawLamp)
	g.restore()
}
