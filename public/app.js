function displayResults (space) {
    $("#scraped-articles").empty();
  space.forEach(function(tip) {
    var card = $("<div>").addClass("card");
    var cardBody = $("<div>").addClass("card-body");
    var cardText = $("<div>").addClass("text");
    var title = $("<h4>")
      .addClass("card-title")
      .text(tip.title);
    var aTag = $("<a>").attr("href", tip.link);
    var pTag = $("<p>")
      .addClass("card-text")
      .text(tip.description);
    aTag.append(title);
    cardText.append(aTag, pTag);
    cardBody.append(cardText);
    card.append(cardBody);
    $("#scraped-articles").append(card);
  });
}