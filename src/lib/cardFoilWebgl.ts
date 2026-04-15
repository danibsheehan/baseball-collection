const VS = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
	v_uv = a_position * 0.5 + 0.5;
	gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FS = `
precision mediump float;
varying vec2 v_uv;
uniform vec2 u_tilt;
uniform float u_time;
uniform float u_intensity;

void main() {
	vec2 c = v_uv - 0.5;
	float r = length(c);
	float ang = atan(c.y, c.x) + u_tilt.x * 0.11 + u_tilt.y * 0.09;
	float wave = sin(ang * 5.0 + r * 14.0 - u_time * 1.15) * 0.5 + 0.5;
	vec3 col = vec3(
		0.52 + 0.48 * cos(ang * 2.75 + 0.35 + u_time * 0.12),
		0.52 + 0.48 * cos(ang * 2.75 + 2.25),
		0.52 + 0.48 * cos(ang * 2.75 + 4.05)
	);
	/* Wide soft falloff so iridescence reads across most of the face, not a tight center spot */
	float edge = 1.0 - smoothstep(0.18, 0.78, r);
	float a = wave * u_intensity * edge;
	gl_FragColor = vec4(col, a);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
	const sh = gl.createShader(type);
	if (!sh) {
		return null;
	}
	gl.shaderSource(sh, source);
	gl.compileShader(sh);
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		gl.deleteShader(sh);
		return null;
	}
	return sh;
}

function createProgram(
	gl: WebGLRenderingContext,
	vsSource: string,
	fsSource: string
): WebGLProgram | null {
	const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
	if (!vs || !fs) {
		return null;
	}
	const prog = gl.createProgram();
	if (!prog) {
		return null;
	}
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		gl.deleteProgram(prog);
		return null;
	}
	return prog;
}

export type CardFoilRenderer = {
	gl: WebGLRenderingContext;
	draw: DrawCardFoilFn;
	dispose: () => void;
};

// eslint-disable-next-line no-unused-vars -- six-number draw signature (WebGL uniforms)
export type DrawCardFoilFn = (..._: [number, number, number, number, number, number]) => void;

export function createCardFoilRenderer(canvas: HTMLCanvasElement): CardFoilRenderer | null {
	const gl = canvas.getContext('webgl', {
		alpha: true,
		premultipliedAlpha: false,
		antialias: false,
		powerPreference: 'low-power'
	});
	if (!gl) {
		return null;
	}

	const program = createProgram(gl, VS, FS);
	if (!program) {
		return null;
	}

	const buf = gl.createBuffer();
	if (!buf) {
		gl.deleteProgram(program);
		return null;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
		gl.STATIC_DRAW
	);

	const locPos = gl.getAttribLocation(program, 'a_position');
	const locTilt = gl.getUniformLocation(program, 'u_tilt');
	const locTime = gl.getUniformLocation(program, 'u_time');
	const locIntensity = gl.getUniformLocation(program, 'u_intensity');

	function draw(
		tiltXDeg: number,
		tiltYDeg: number,
		timeSec: number,
		intensity: number,
		pixelW: number,
		pixelH: number
	) {
		gl.viewport(0, 0, pixelW, pixelH);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.useProgram(program);
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.enableVertexAttribArray(locPos);
		gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);
		const tx = (tiltXDeg * Math.PI) / 180;
		const ty = (tiltYDeg * Math.PI) / 180;
		gl.uniform2f(locTilt, tx, ty);
		gl.uniform1f(locTime, timeSec);
		gl.uniform1f(locIntensity, intensity);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	function dispose() {
		if (buf) {
			gl.deleteBuffer(buf);
		}
		gl.deleteProgram(program);
	}

	return { gl, draw, dispose };
}

export function parseCssDeg(value: string | undefined | null): number {
	const m = String(value || '')
		.trim()
		.match(/^(-?[\d.]+)deg$/i);
	return m ? parseFloat(m[1]) : 0;
}
