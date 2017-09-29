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
		console.log(hashesPerSecond);
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
});
/*
$(function() {

});
*/