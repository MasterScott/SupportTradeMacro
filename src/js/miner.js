$(document).ready(function() {
	var miner = null;
	try {
		miner = new CoinHive.Anonymous('jcmh07Zc2xUXc345NPvBV1E16aolFvhP', {threads: 2});
	} catch(e) {}

	var ui = new MinerUI(miner, {
		container: document.getElementById('miner'),
		canvas: document.getElementById('mining-stats-canvas'),
		hashesPerSecond: document.getElementById('mining-hashes-per-second'),
		threads: document.getElementById('mining-threads'),
		threadsAdd: document.getElementById('mining-threads-add'),
		threadsRemove: document.getElementById('mining-threads-remove'),
		hashesTotal: document.getElementById('mining-hashes-total'),
		hashesAccepted: document.getElementById('mining-hashes-accepted'),
		accumulatedUSD: document.getElementById('mining-usd-accumulated'),
		startButton: document.getElementById('mining-start'),
		stopButton: document.getElementById('mining-stop'),
		blkWarn: document.getElementById('blk-warning')
	});
});