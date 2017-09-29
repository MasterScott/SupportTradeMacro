var MinerUI = function(miner, elements) {
	this.miner = miner;
	this.elements = elements;

	this.intervalUpdateStats = 0;
	this.intervalDrawGraph = 0;
	this.intervalUpdateUSD = 0;

	this.ctx = this.elements.canvas.getContext('2d');

	this.elements.startButton.addEventListener('click', this.start.bind(this));
	this.elements.stopButton.addEventListener('click', this.stop.bind(this));

	this.elements.threadsAdd.addEventListener('click', this.addThread.bind(this));
	this.elements.threadsRemove.addEventListener('click', this.removeThread.bind(this));

	this.stats = [];
	for (var i = 0, x = 0; x < 300; i++, x += 5) {
		this.stats.push({hashes: 0, accepted: 0});
	}
	this.acceptedHashes = 0;
	this.accumulatedUSD = 0;

	if (this.miner) {
		this.didAcceptHash = false;
		this.miner.on('accepted', function(){
			this.didAcceptHash = true;
		}.bind(this));
	}
};

MinerUI.prototype.start = function(ev) {
	ev.preventDefault();

	if (!this.miner) {
		this.elements.blkWarn.style.display = 'block';
		this.elements.startButton.style.display = 'none';
		return false;
	}

	this.miner.start(CoinHive.FORCE_MULTI_TAB);
	this.elements.container.classList.add('running');
	this.elements.container.classList.remove('stopped');

	this.intervalUpdateStats = setInterval(this.updateStats.bind(this), 50);
	this.intervalDrawGraph = setInterval(this.drawGraph.bind(this), 500);
	this.intervalUpdateUSD = setInterval(this.getUSD.bind(this), 60000);

	this.elements.threads.textContent = this.miner.getNumThreads();

	return false;
};

MinerUI.prototype.stop = function(ev) {
	this.miner.stop();
	this.elements.hashesPerSecond.textContent = 0;
	this.elements.container.classList.remove('running');
	this.elements.container.classList.add('stopped');

	clearInterval(this.intervalUpdateStats);
	clearInterval(this.intervalDrawGraph);

	ev.preventDefault();
	return false;
};

MinerUI.prototype.addThread = function(ev) {
	this.miner.setNumThreads(this.miner.getNumThreads() + 1);
	this.elements.threads.textContent = this.miner.getNumThreads();

	ev.preventDefault();
	return false;
};

MinerUI.prototype.removeThread = function(ev) {
	this.miner.setNumThreads(Math.max(0, this.miner.getNumThreads() - 1));
	this.elements.threads.textContent = this.miner.getNumThreads();

	ev.preventDefault();
	return false;
};

MinerUI.prototype.updateStats = function() {
	this.elements.hashesPerSecond.textContent = this.miner.getHashesPerSecond().toFixed(1);
	this.elements.hashesTotal.textContent = this.miner.getTotalHashes(true);
	this.elements.hashesAccepted.textContent = this.miner.getAcceptedHashes(true);
};

MinerUI.prototype.drawGraph = function() {

	// Resize canvas if necessary
	if (this.elements.canvas.offsetWidth !== this.elements.canvas.width) {
		this.elements.canvas.width = this.elements.canvas.offsetWidth;
		this.elements.canvas.height = this.elements.canvas.offsetHeight;
	}
	var w = this.elements.canvas.width;
	var h = this.elements.canvas.height;


	var current = this.stats.shift();
	var last = this.stats[this.stats.length-1];
	current.hashes = this.miner.getHashesPerSecond();
	current.accepted = this.didAcceptHash;
	this.didAcceptHash = false;
	this.stats.push(current);

	// Find max value
	var vmax = 0;
	for (var i = 0; i < this.stats.length; i++) {
		var v = this.stats[i].hashes;
		if (v > vmax) { vmax = v; }
	}

	// Draw all bars
	this.ctx.clearRect(0, 0, w, h);
	for (var i = this.stats.length, j = 1; i--; j++) {
		var s = this.stats[i];

		var vh = ((s.hashes/vmax) * (h - 16))|0;
		if (s.accepted) {
			this.ctx.fillStyle = '#aaa';
			this.ctx.fillRect(w - j*10, h - vh, 9, vh);
		}
		else {
			this.ctx.fillStyle = '#ccc';
			this.ctx.fillRect(w - j*10, h - vh, 9, vh);
		}
	}
};

MinerUI.prototype.getUSD = function() {
	$.get( "https://www.cryptocompare.com/api/data/coinsnapshot/?fsym=XMR&tsym=USD", function( data ) {
		var priceUSD = data.Data.AggregatedData.Price;
		var blockReward = data.Data.BlockReward;
		var totalCoinsMined = data.Data.TotalCoinsMined;
		var netHashesPerSecond = data.Data.NetHashesPerSecond;

		// https://monero.stackexchange.com/questions/1388/how-much-cpu-power-to-mine-1-coin-a-day
		var hashesPerSecondToGet1XMRPerDay = (728 * netHashesPerSecond) / (18446744.073709551616 - totalCoinsMined);
		//var hashesPerDay1XMR = (netHashesPerSecond) / (720 * blockReward);
		var totalHashesToGet1XMRPerDay = hashesPerSecondToGet1XMRPerDay * 24 * 60 * 60;
		var XMRPerHash = 1 / totalHashesToGet1XMRPerDay;
		var accumulatedXMR = Math.round(acceptedHashes) * XMRPerHash;
		var accumulatedUSD = priceUSD * accumulatedXMR;
		//console.log(accumulatedUSD);

		//$('#accumulatedUSD').text(accumulatedUSD);
		this.accumulatedUSD = accumulatedUSD;
		this.elements.accumulatedUSD.textContent = accumulatedUSD;
	});
};
