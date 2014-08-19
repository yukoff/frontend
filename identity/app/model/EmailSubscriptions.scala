package model

case class EmailSubscriptions(subscriptions: List[EmailSubscription])
case class EmailSubscription(name: String, section: String, description: String, frequency: String, listId: String, popularity: Int = 0)
object EmailSubscription {
  def apply(emailSubscription: EmailSubscription) = emailSubscription
}
object EmailSubscriptions {
  def apply(): EmailSubscriptions = EmailSubscriptions(List(
    EmailSubscription(
      "The Guardian today - UK edition",
      "News",
      "Our editors' picks for the day's top news and commentary delivered to your inbox each morning.",
      "Every weekday morning",
      "37",
      12
    ),
    EmailSubscription(
      "The Guardian today - US edition",
      "News",
      "Our editors' picks for the day's top news and commentary delivered to your inbox each morning.",
      "Every weekday morning",
      "1493",
      11
    ),
    EmailSubscription(
      "The Guardian today - AUS edition",
      "News",
      "Our editors' picks for the day's top news and commentary delivered to your inbox each weekday.",
      "Every weekday",
      "1506",
      11
    ),
    EmailSubscription(
      "Comment is free",
      "The best of Comment is free",
      "Comment is free's daily email newsletter with the most shared comment, analysis and editorial articles from the last 24 hours — sign up to read, share and join the debate on the Guardian's most popular opinion pieces every lunchtime.",
      "Weekday lunchtime",
      "2313",
      10
    ),
    EmailSubscription(
      "Zip file",
      "Technology",
      "For all you need to know about technology in the world this week, news, analysis and comment.",
      "Every Thursday",

      "1902",
      10
    ),
    EmailSubscription(
      "The Fiver",
      "Football",
      "The Fiver is theguardian.com/sport's free football email. Every weekday we round up the day's news and gossip in our own belligerent, sometimes intelligent and — very occasionally — funny way. The Fiver is delivered every Monday to Friday at around 5pm — hence the name.",
      "5pm every weekday",
      "218",
      10
    ),
    EmailSubscription(
      "Media briefing",
      "Media",
      "An indispensable summary of what the papers are saying about media on your desktop before 9am. We summarise the media headlines in every newspaper from the Wall Street Journal to the Daily Star.",
      "Weekday mornings",
      "217",
      7
    ),
    EmailSubscription(
      "Guardian book club",
      "Books",
      "Hosted by John Mullan, the Guardian book club considers a book a month via a weekly column and live Q&A session. Be the first to find out about forthcoming events and featured authors.",
      "Every Sunday",
      "131"
    ),
    EmailSubscription(
      "The Breakdown",
      "Rugby Union",
      "Sign up for our rugby union email, written by our rugby correspondent Paul Rees. Every Thursday Paul will give his thoughts on the big stories, review the latest action and provide gossip from behind the scenes in his unique and indomitable style.",
      "Every Thursday",
      "219"
    ),
    EmailSubscription(
      "Art Weekly",
      "Art and design",
      "For your art world low-down, sign up to the Guardian's Art Weekly email and get all the latest news, reviews and comment delivered straight to your inbox.",
      "",
      "99"
    ),
    EmailSubscription(
      "Close up",
      "Film",
      "Every Thursday, rely on Close up to bring you Guardian film news, reviews and much, much more.",
      "Every Thursday",
      "40",
      5
    ),
    EmailSubscription(
      "Film Today",
      "Film",
      "Our film editors recap the top headlines each weekday and deliver them straight to your inbox in time for your evening commute.",
      "Everyday",
      "1950",
      5
    ),
    EmailSubscription(
      "Crossword editor's update",
      "Crosswords",
      "Register to receive our monthly crossword email by the Guardian's crossword editor with the latest issues and tips about theguardian.com/crosswords.",
      "",
      "101"
    ),
    EmailSubscription(
      "Fashion statement",
      "Fashion",
      "The Guardian sorts the wheat from the chaff to deliver the latest news, views and shoes from the style frontline. Sign up to Fashion Statement, sent every Friday.",
      "Every Friday",
      "105",
      9
    ),
    EmailSubscription(
      "Green light",
      "Environment",
      "In each weekly edition our editors highlight the most important stories of the week including data, opinion pieces and background guides. We'll also flag up our best video, picture galleries, podcasts, blogs and green living guides.",
      "",
      "38"
    ),
    EmailSubscription(
      "Poverty matters",
      "Global development",
      "Our editors track what's happening in development with a special focus on the millennium development goals. Sign up to get all the most important debate and discussion from around the world delivered to your inbox every fortnight.",
      "",
      "113"
    ),
    EmailSubscription(
      "The Bundle",
      "Law",
      "Get the Guardian's unique take on the latest developments from the legal world direct to your inbox every week.",
      "",
      "108"
    ),
    EmailSubscription(
      "TEFL update",
      "Learning English",
      "Sign up to TEFL Update and get free classroom materials and the latest English language teaching news and views from the Guardian Weekly.",
      "",
      "166"
    ),
    EmailSubscription(
      "Money Talks",
      "Money",
      "Stay on top of the best personal finance and money news of the week, including insight and behind-the-scenes accounts from your favourite Guardian Money editors.",
      "",
      "1079",
      9
    ),
    EmailSubscription(
      "Society briefing",
      "Society",
      "Have the top news and columnists delivered to your inbox every week. Stay on top of the latest policy announcements, keep ahead of current thinking, and find out what changes to legislation will mean for your job.",
      "",
      "208"
    ),
    EmailSubscription(
      "Sleeve notes",
      "Music",
      "Everything you need to know from the Guardian's music site, squeezed into one handy email.",
      "Every Friday",
      "39",
      8
    ),
    EmailSubscription(
      "Metropolitan Lines",
      "London",
      "On Fridays, London blogger Dave Hill will send you an update on the preceding week's key events in London politics, as well as keeping track of London's dynamic cultural and sporting life.",
      "Every Friday",
      "98"
    ),
    EmailSubscription(
      "Australian politics",
      "Politics",
      "All the latest news and comment on Australian politics from the Guardian, delivered to you every weekday.",
      "Weekdays at midday",
      "1866"
    ),
    EmailSubscription(
      "The Spin",
      "Cricket",
      "The Spin brings you all the latest comment and news, rumour and humour from the world of cricket every Tuesday. It promises not to use tired old cricket cliches, but it might just bowl you over.",
      "Every Tuesday",
      "220"
    ),
    EmailSubscription(
      "The Observer Food Monthly",
      "Food & Drink",
      "Sign up to the Observer Food Monthly newsletter for all your food and drink news, tips, offers, recipes and competitions.",
      "Monthly",
      "248"
    ),
    EmailSubscription(
      "The Flyer",
      "Travel",
      "Sign up to The Flyer for all the latest travel stories, plus find links to hundreds of UK hotel and restaurant reviews; insider tips on the world's best cities; a road-tripper's guide to the US; and highlights of our most inspiring top 10s.",
      "Every Wednesday",
      "2211",
      10
    )
  ))
}