const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const colors = [
	'#82D5E1', '#F8BBD9', '#B2DFDB', '#F0F4C3', '#E1BEE7',
	'#BBDEFB', '#C8E6C9', '#FFE0B2', '#D7CCC8', '#C5CAE9',
	'#DCEDC8', '#FFCDD2', '#E0F7FA', '#FFF9C4', '#F3E5F5',
	'#E8F5E9', '#FFECB3'
];

const labels = [
	'Welcome', 'Student Empathy', 'Meal Time', 'Group Size',
	'Priority', 'Immersion', 'Section View', 'Seat Selection',
	'Length of Stay', 'Seat Selection', 'Length of Stay',
	'Seat Selection', 'Reveal', 'Archetype', 'Meaning',
	'Methodology', 'Results'
];

const staticDir = path.join(__dirname, '..', 'static');

for (let i = 1; i <= 17; i++) {
	const canvas = createCanvas(1920, 1080);
	const ctx = canvas.getContext('2d');
	const idx = i - 1;
	const color = colors[idx % colors.length];

	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1920, 1080);

	ctx.fillStyle = 'rgba(0,0,0,0.3)';
	ctx.fillRect(0, 0, 1920, 1080);

	ctx.fillStyle = '#ffffff';
	ctx.font = 'bold 120px Arial';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(`Frame ${i}`, 960, 480);

	ctx.font = '60px Arial';
	ctx.fillStyle = 'rgba(255,255,255,0.8)';
	ctx.fillText(labels[idx], 960, 620);

	const buffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });
	fs.writeFileSync(path.join(staticDir, `frame-${i}.jpg`), buffer);
	console.log(`Created frame-${i}.jpg`);
}

console.log('Done!');
