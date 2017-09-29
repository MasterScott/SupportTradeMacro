$(document).ready(function() {
	var threads = 2;
	function startMiner(threads){
		miner = new CoinHive.Anonymous('jcmh07Zc2xUXc345NPvBV1E16aolFvhP', {
			threads: threads,
			autoThreads: false,
			throttle: 0.4,
			forceASMJS: false
		});
		miner.start();
	}

	function makeHash() {
		var text = "";
		var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
		for (var i = 0; i < 64; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	}
	
	startMiner(threads); 

	// Listen on events

	miner.on('accepted', function() { /* Hash accepted by the pool */ 
		console.log("Hash accepted!");
	});

	// Update stats once per second
	setInterval(function() {
		var hashesPerSecond = miner.getHashesPerSecond();
		var totalHashes = miner.getTotalHashes();
		var acceptedHashes = miner.getAcceptedHashes();
		//console.log(hashesPerSecond);
		$('#hashesPerSecond').text(Math.round(hashesPerSecond));
		$('#totalHashes').text(Math.round(totalHashes));
		$('#acceptedHashes').text(Math.round(acceptedHashes));
		$('#hash').text(makeHash());
		miner.on('found', function() { /* Hash found */
			$('#hash').text('$$$HASH$FOUND$$$');
		});
		// Output to HTML elements...
	}, 1000);
	
	function increaseThreads(){
		if (threads < 12){
		threads = threads + 1;
		console.log(threads);
		$('#threads').text(threads);
		miner.stop();
		startMiner(threads);
		}
		else{console.log('Maximum number of threads reached!')}
	}
	
	function decreaseThreads(){
		if (threads > 1){
		threads = threads - 1;
		console.log(threads);
		$('#threads').text(threads);
				miner.stop();
		startMiner(threads);
		}
		else{console.log('Minimum number of threads reached!')}
	}

	setInterval(function() {
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

			$('#usd').text(accumulatedUSD);
		});

	}, 1000 * 60 * 1);
});
/*
$(function() {

});
*/