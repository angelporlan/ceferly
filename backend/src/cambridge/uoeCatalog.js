const examName = (level) => {
    if (level === "B1") return "B1 Preliminary";
    if (level === "B2") return "B2 First";
    return "C1 Advanced";
};

const mc = (level, n, topic, sentence, options, answer, rule) => ({
    level,
    exam: examName(level),
    part: 1,
    type: "multiple_choice_cloze",
    title: `${examName(level)} Use of English Part 1 — ${topic} (#${n})`,
    question_text: sentence,
    options,
    correct_answer: answer,
    explanation_rule: rule
});

const oc = (level, n, topic, sentence, answer, rule) => ({
    level,
    exam: examName(level),
    part: 2,
    type: "open_cloze",
    title: `${examName(level)} Use of English Part 2 — ${topic} (#${n})`,
    question_text: sentence,
    options: [],
    correct_answer: answer,
    explanation_rule: rule
});

const wf = (level, n, topic, sentence, stem, answer, rule) => ({
    level,
    exam: examName(level),
    part: 3,
    type: "word_formation",
    title: `${examName(level)} Use of English Part 3 — ${topic} (#${n})`,
    question_text: sentence,
    options: [],
    correct_answer: answer,
    stem,
    explanation_rule: rule
});

const kwt = (level, n, topic, original, keyword, gapped, answer, rule) => ({
    level,
    exam: examName(level),
    part: 4,
    type: "key_word_transformation",
    title: `${examName(level)} Use of English Part 4 — ${topic} (#${n})`,
    question_text: gapped,
    reading_text: original,
    options: [],
    correct_answer: answer,
    keyword,
    original,
    explanation_rule: rule
});

export const CAMBRIDGE_UOE_EXERCISES = [
    mc("B1", 1, "A Saturday market", "Every Saturday morning I ______ the bus into town to visit the market.", ["catch", "do", "make", "go"], "catch", "At B1, transport collocations use catch the bus/train/plane, not do/make the bus."),
    mc("B1", 2, "A school trip", "The students are really looking ______ to the museum visit next Friday.", ["forward", "after", "for", "into"], "forward", "look forward to + noun/-ing expresses excitement about a future event."),
    mc("B1", 3, "A new hobby", "Marta has always been interested ______ photography and nature.", ["in", "on", "at", "for"], "in", "The adjective interested is followed by the preposition in."),
    mc("B1", 4, "Childhood sport", "When I was younger I ______ to play tennis every weekend with my uncle.", ["used", "use", "using", "uses"], "used", "used to + infinitive describes a past habit that is no longer true."),
    mc("B1", 5, "Waiting at the station", "Please call me ______ soon as the train arrives.", ["as", "so", "too", "very"], "as", "The fixed linker as soon as means immediately when."),
    mc("B1", 6, "A wet walk", "______ it was raining, we still walked home along the river.", ["Although", "Despite", "Because", "However"], "Although", "although + clause contrasts two ideas; despite needs a noun phrase, not a full clause."),
    mc("B1", 7, "Buying a ticket", "I didn't have ______ money to buy a first-class ticket.", ["enough", "too", "much too", "plenty"], "enough", "enough comes after the adjective but before the noun: enough money."),
    mc("B1", 8, "A long day", "She was ______ tired that she fell asleep on the sofa.", ["so", "such", "too", "enough"], "so", "so + adjective + that expresses result; such is used before a noun phrase."),
    mc("B1", 9, "Drinks at a café", "I prefer tea ______ coffee in the afternoon.", ["to", "than", "from", "that"], "to", "prefer A to B is the standard B1 comparative preference pattern."),

    oc("B1", 1, "A city break", "I have never ______ to Lisbon, but I would love to go next spring.", "been", "Present perfect with never uses been to for life experience of visiting a place."),
    oc("B1", 2, "The neighbour", "That's the woman ______ helped me carry the shopping upstairs.", "who", "who is the subject relative pronoun for people in defining relative clauses."),
    oc("B1", 3, "A picnic plan", "We will cancel the picnic ______ it rains tomorrow morning.", "if", "First conditional: if + present, will + infinitive for a real future possibility."),
    oc("B1", 4, "Two jackets", "This jacket is cheaper ______ the one in the other shop.", "than", "Comparatives of adjectives take than, not that or to."),
    oc("B1", 5, "A language course", "She has lived in Manchester ______ 2019.", "since", "Present perfect + since + starting point; for would need a period of time."),
    oc("B1", 6, "A guidebook", "This is the map ______ we used during our walking tour.", "which", "which (or that) introduces a defining relative clause for things."),
    oc("B1", 7, "Late for class", "He missed the start of the lesson ______ the bus was delayed.", "because", "because + clause gives a reason; because of needs a noun."),
    oc("B1", 8, "A quiet street", "______ is a small bakery on the corner of my street.", "There", "There is/are introduces existence; they is a pronoun referring to people/things already known."),
    oc("B1", 9, "Homework night", "I usually do my homework on my ______ after dinner.", "own", "on my own means alone / without help."),

    wf("B1", 1, "A wedding speech", "Everyone noticed the ______ in her voice when she spoke. HAPPY", "HAPPY", "happiness", "The adjective happy forms the abstract noun happiness with -ness."),
    wf("B1", 2, "A job interview", "The candidate gave a very ______ presentation. SUCCESS", "SUCCESS", "successful", "success (noun) → successful (adjective) with -ful."),
    wf("B1", 3, "Mountain roads", "Driving on ice can be extremely ______. DANGER", "DANGER", "dangerous", "danger → dangerous; the adjective takes -ous."),
    wf("B1", 4, "Choosing a course", "It was a difficult ______, but she chose biology. DECIDE", "DECIDE", "decision", "The verb decide forms the noun decision (not decidement)."),
    wf("B1", 5, "A locked door", "It is ______ to open the door without the key. POSSIBLE", "POSSIBLE", "impossible", "The negative prefix im- is used before p: impossible."),
    wf("B1", 6, "Old classmates", "Their ______ started in primary school. FRIEND", "FRIEND", "friendship", "friend → friendship names the relationship."),
    wf("B1", 7, "Lab instructions", "Please read the instructions ______. CARE", "CARE", "carefully", "Adverbs of manner are often formed with -ly: carefully."),
    wf("B1", 8, "After the factory closed", "Many people in the town were ______ last year. EMPLOY", "EMPLOY", "unemployed", "The negative adjective unemployed uses un- + past participle."),
    wf("B1", 9, "A shop window", "The new phones look very ______. ATTRACT", "ATTRACT", "attractive", "attract → attractive (adjective with -ive)."),

    kwt("B1", 1, "A trip to Rome", "The last time I visited Rome was in 2020.", "BEEN", "I ______ Rome since 2020.", "have not been to / haven't been to", "Present perfect with since + last time: have not been to + place since + point in time."),
    kwt("B1", 2, "A noisy party", "The music was so loud that we couldn't talk.", "SUCH", "It was ______ that we couldn't talk.", "such loud music", "so + adjective + that ⇔ such + adjective + noun + that."),
    kwt("B1", 3, "Photography club", "Marta is interested in photography.", "INTEREST", "Photography ______ Marta.", "is of interest to / interests", "be interested in ⇔ be of interest to / the verb interest."),
    kwt("B1", 4, "Football practice", "Luis is a good footballer.", "AT", "Luis is ______ football.", "good at", "be good at + noun/-ing is the B1 ability collocation."),
    kwt("B1", 5, "Cancelled match", "They cancelled the match because of the rain.", "BECAUSE", "They cancelled the match ______ it was raining.", "because", "because of + noun ⇔ because + clause."),
    kwt("B1", 6, "A heavy box", "The box was so heavy that she couldn't lift it.", "TOO", "The box was ______ lift.", "too heavy to", "so + adj + that + can't ⇔ too + adj + to-infinitive."),
    kwt("B1", 7, "Tea or coffee", "I like tea more than coffee.", "PREFER", "I ______ coffee.", "prefer tea to", "like A more than B ⇔ prefer A to B."),
    kwt("B1", 8, "A past habit", "I played the piano every day when I was a child.", "USED", "I ______ the piano every day when I was a child.", "used to play", "past habit ⇔ used to + infinitive."),
    kwt("B1", 9, "Holiday plans", "I am excited about the holiday.", "FORWARD", "I am looking ______ the holiday.", "forward to", "be excited about ⇔ look forward to."),

    mc("B2", 1, "A research grant", "The committee finally ______ to fund the climate project after a long debate.", ["agreed", "accepted", "admitted", "allowed"], "agreed", "agree to + infinitive is the correct collocation for reaching a decision; accept typically takes a noun."),
    mc("B2", 2, "Urban wildlife", "Foxes have ______ in adapting to life in large cities.", ["succeeded", "managed", "achieved", "resulted"], "succeeded", "succeed in + -ing; manage takes to-infinitive, achieve takes a noun."),
    mc("B2", 3, "A product launch", "The new app was ______ released after months of testing.", ["eventually", "actually", "currently", "properly"], "eventually", "eventually means after a delay; actually contrasts expectation, currently means now."),
    mc("B2", 4, "Team conflict", "She tried to ______ a disagreement between the two designers.", ["settle", "solve", "sort", "fix"], "settle", "settle a disagreement/argument is the natural collocation at B2; solve collocates with problem."),
    mc("B2", 5, "Public speaking", "He is not ______ to speaking in front of large audiences.", ["accustomed", "familiar", "aware", "used"], "accustomed", "be accustomed to + -ing; familiar with and aware of take different complements. used to would need to, not to + -ing without be."),
    mc("B2", 6, "A delayed report", "______ having little time, she completed the report before the deadline.", ["Despite", "Although", "However", "Whereas"], "Despite", "despite + -ing/noun; although needs a clause with a subject and verb."),
    mc("B2", 7, "Energy policy", "The government should ______ more attention to renewable energy.", ["pay", "give", "make", "take"], "pay", "pay attention to is a fixed collocation."),
    mc("B2", 8, "A museum visit", "Visitors are asked to ______ from touching the sculptures.", ["refrain", "prevent", "avoid", "stop"], "refrain", "refrain from + -ing is formal prohibition; prevent needs an object."),
    mc("B2", 9, "Climate article", "The article ______ a number of practical ways to cut household waste.", ["outlines", "tells", "says", "speaks"], "outlines", "outline + noun means summarise the main points; tell/say need different patterns."),

    oc("B2", 1, "Remote work", "A growing number of companies now allow staff to work ______ home at least twice a week.", "from", "work from home is the standard prepositional collocation."),
    oc("B2", 2, "A book review", "The novel, ______ was published last year, has already won two prizes.", "which", "Non-defining relative clauses for things use which, set off by commas."),
    oc("B2", 3, "Lost keys", "I can't find my keys. I ______ have left them in the café.", "must", "must have + past participle expresses a logical deduction about the past."),
    oc("B2", 4, "Conservation", "Many species will die ______ unless habitats are protected.", "out", "The phrasal verb die out means become extinct."),
    oc("B2", 5, "A job offer", "She took the job even ______ the salary was lower than expected.", "though", "even though + clause (concession); even if is hypothetical."),
    oc("B2", 6, "Statistics", "The number of cyclists in the city has increased ______ 20% since 2018.", "by", "increase by + percentage; increase to names the new total."),
    oc("B2", 7, "A formal letter", "I am writing ______ response to your advertisement for a volunteer guide.", "in", "in response to is the standard formal letter opener."),
    oc("B2", 8, "Time clauses", "I will send the files as soon as I ______ them.", "receive / have received", "After as soon as, a present (simple or perfect) refers to the future; will is not used."),
    oc("B2", 9, "Comparatives", "The more you practise, the ______ confident you will feel in the speaking test.", "more", "The more ..., the more + adjective is a parallel comparative pattern."),

    wf("B2", 1, "A science feature", "There is growing ______ that diet affects concentration. AWARE", "AWARE", "awareness", "aware → awareness (abstract noun with -ness)."),
    wf("B2", 2, "City planning", "The ______ of the old market disappointed local traders. CLOSE", "CLOSE", "closure", "close → closure (noun of event/process)."),
    wf("B2", 3, "A film review", "The ending of the film was highly ______. PREDICT", "PREDICT", "predictable", "predict → predictable (able to be predicted)."),
    wf("B2", 4, "Workplace stress", "Regular breaks can increase ______. PRODUCT", "PRODUCT", "productivity", "product → productivity (the rate of useful output)."),
    wf("B2", 5, "A news report", "The claims made in the advert were ______. LEAD", "LEAD", "misleading", "mislead → misleading; the prefix mis- marks false guidance."),
    wf("B2", 6, "University life", "Students need a high degree of ______. INDEPENDENT", "INDEPENDENT", "independence", "independent → independence (noun with -ence)."),
    wf("B2", 7, "A travel blog", "The island is ______ for its volcanic beaches. FAME", "FAME", "famous", "fame → famous (adjective)."),
    wf("B2", 8, "Public health", "______ eating is essential for long-term health. HEALTH", "HEALTH", "Healthy", "health → healthy (adjective before a noun)."),
    wf("B2", 9, "A complaint letter", "I find the delay completely ______. ACCEPT", "ACCEPT", "unacceptable", "accept → acceptable → unacceptable with un-."),

    kwt("B2", 1, "A cancelled flight", "They continued the meeting although the director was absent.", "DESPITE", "They continued the meeting ______ the director.", "despite the absence of / despite the director being absent", "although + clause ⇔ despite + noun / -ing."),
    kwt("B2", 2, "Reported advice", "\"You should revise the phrasal verbs,\" the teacher told us.", "ADVISED", "The teacher ______ the phrasal verbs.", "advised us to revise", "should ⇔ advise someone to + infinitive."),
    kwt("B2", 3, "A renovated flat", "They are going to paint our kitchen next week.", "HAVING", "We are ______ next week.", "having our kitchen painted", "causative have/get something done."),
    kwt("B2", 4, "A late train", "I didn't take an umbrella, so I got wet.", "IF", "I wouldn't have got wet ______ an umbrella.", "if I had taken / if I'd taken", "Third conditional: if + past perfect, would have + past participle."),
    kwt("B2", 5, "A noisy hotel", "I regret booking that hotel.", "WISH", "I ______ that hotel.", "wish I had not booked / wish I hadn't booked", "regret + -ing ⇔ wish + past perfect."),
    kwt("B2", 6, "A company decision", "They postponed the launch because the tests were incomplete.", "PUT", "They ______ because the tests were incomplete.", "put off the launch / put the launch off", "postpone ⇔ put off."),
    kwt("B2", 7, "A better option", "I would rather stay in than go to the party.", "PREFER", "I ______ to the party.", "would prefer to stay in than go / prefer staying in to going", "would rather + infinitive ⇔ would prefer to / prefer -ing to -ing."),
    kwt("B2", 8, "A warning", "Take a map because you might get lost.", "CASE", "Take a map ______ lost.", "in case you get", "in case + present refers to a possible future problem."),
    kwt("B2", 9, "A known author", "People believe that she wrote the article.", "BELIEVED", "She ______ the article.", "is believed to have written", "Passive reporting: is believed to have + past participle for a past action."),

    mc("C1", 1, "A policy paper", "The minister's remarks were widely ______ as an attempt to shift the blame.", ["interpreted", "translated", "regarded", "supposed"], "interpreted", "be interpreted as = understood to mean; regarded as needs a noun complement more than a clause of purpose."),
    mc("C1", 2, "Academic style", "The study ______ into question several long-held assumptions about memory.", ["calls", "puts", "brings", "takes"], "calls", "call into question is the academic collocation meaning challenge."),
    mc("C1", 3, "Editorial tone", "Her argument is ______ flawed, even if the examples are vivid.", ["fundamentally", "deeply", "highly", "utterly"], "fundamentally", "fundamentally flawed is the natural collocation for a core weakness in an argument."),
    mc("C1", 4, "Research ethics", "Participants were assured that their data would remain ______. ", ["confidential", "confident", "secretive", "concealed"], "confidential", "confidential is the ethical/legal register; secretive describes a person's behaviour."),
    mc("C1", 5, "A book launch", "The critic ______ praise on the author's latest novel.", ["heaped", "poured", "cast", "laid"], "heaped", "heap praise on is an idiomatic collocation of strong commendation."),
    mc("C1", 6, "Economic outlook", "Growth is likely to remain ______ in the coming quarter.", ["sluggish", "slack", "slackened", "slugged"], "sluggish", "sluggish growth is the standard economics collocation for slow movement."),
    mc("C1", 7, "A legal ruling", "The court ______ the earlier decision and ordered a retrial.", ["overturned", "overtook", "overruled out", "overdrawn"], "overturned", "overturn a decision/verdict is the legal collocation."),
    mc("C1", 8, "Media analysis", "The documentary ______ light on working conditions in the supply chain.", ["shed", "gave", "made", "opened"], "shed", "shed light on = make something easier to understand."),
    mc("C1", 9, "A debate closing", "______ of the benefits, the scheme remains controversial.", ["Irrespective", "Regarding", "Concerning", "Considering"], "Irrespective", "irrespective of + noun means without considering; regarding/concerning mean about."),

    oc("C1", 1, "A conference abstract", "Little ______ the researchers know how influential the paper would become.", "did", "Negative adverbial little + inversion: Little did + subject + verb."),
    oc("C1", 2, "Urban design", "The square was redesigned ______ as to encourage people to linger.", "so", "so as to + infinitive expresses purpose in more formal written English."),
    oc("C1", 3, "A memoir", "No sooner had she sat down ______ the phone rang again.", "than", "no sooner ... than is a fixed correlative pair with inversion."),
    oc("C1", 4, "Climate finance", "Investment in the sector has fallen ______ short of what scientists say is required.", "far", "fall far short of is an intensifying collocation."),
    oc("C1", 5, "A biography", "He went ______ to become one of the leading voices in the movement.", "on", "go on to + infinitive = later do something (often successful)."),
    oc("C1", 6, "Editorial hedge", "The findings are interesting, but they should be treated ______ caution.", "with", "treat something with caution is the academic hedge."),
    oc("C1", 7, "A travel essay", "The village is accessible only ______ foot or by boat.", "on", "on foot is the fixed prepositional phrase."),
    oc("C1", 8, "Historical comment", "It was not ______ the 1990s that the archive was opened to the public.", "until", "it was not until + time + that is a cleft time structure."),
    oc("C1", 9, "A science column", "The two theories are not necessarily ______ odds with one another.", "at", "at odds with = in conflict with."),

    wf("C1", 1, "A sociology essay", "Social ______ has increased in several post-industrial cities. EQUAL", "EQUAL", "inequality", "equal → inequality (negative abstract noun)."),
    wf("C1", 2, "An architecture review", "The extension is a bold ______ from the original design. DEPART", "DEPART", "departure", "depart → departure (noun of change/direction)."),
    wf("C1", 3, "A medical journal", "The drug's ______ has been questioned in recent trials. EFFECTIVE", "EFFECTIVE", "effectiveness", "effective → effectiveness (noun)."),
    wf("C1", 4, "A political column", "The speech was criticised for its ______. SIMPLE", "SIMPLE", "oversimplification", "simple → oversimplification names a reductive account of a complex issue."),
    wf("C1", 5, "An economics brief", "There has been a ______ rise in remote contracts. DRAMA", "DRAMA", "dramatic", "drama → dramatic (adjective)."),
    wf("C1", 6, "A psychology paper", "The results were statistically ______. SIGNIFY", "SIGNIFY", "significant", "signify → significant; statistically significant is the standard research collocation."),
    wf("C1", 7, "A museum text", "The restoration was carried out with great ______. PRECISE", "PRECISE", "precision", "precise → precision (noun)."),
    wf("C1", 8, "A leadership profile", "Her ______ to detail is legendary among colleagues. ATTEND", "ATTEND", "attention", "attend → attention in the collocation attention to detail."),
    wf("C1", 9, "A climate briefing", "Such claims are scientifically ______. DEFEND", "DEFEND", "indefensible", "defend → defensible → indefensible with in-."),

    kwt("C1", 1, "A late arrival", "As soon as she finished the report, she emailed it.", "SOONER", "No ______ the report than she emailed it.", "sooner had she finished", "as soon as + past ⇔ no sooner had + past participle + than."),
    kwt("C1", 2, "A safety notice", "Staff are not allowed to enter the archive without permission.", "ACCOUNT", "On ______ enter the archive without permission.", "no account should staff / no account must staff", "on no account + inversion for prohibition."),
    kwt("C1", 3, "A delayed archive", "The files were only released in 1998.", "UNTIL", "It was ______ the files were released.", "not until 1998 that", "only in + year ⇔ it was not until + year + that."),
    kwt("C1", 4, "A tough climb", "She completed the climb although she had little experience.", "DESPITE", "She completed the climb ______ little experience.", "despite having / despite her", "although + clause ⇔ despite + -ing / noun."),
    kwt("C1", 5, "A rumour", "People think the minister leaked the memo.", "HAVE", "The minister is thought ______ the memo.", "to have leaked", "Passive reporting of a past action: is thought to have + past participle."),
    kwt("C1", 6, "A preference", "I would rather not comment on the case.", "PREFER", "I ______ comment on the case.", "would prefer not to", "would rather not + infinitive ⇔ would prefer not to + infinitive."),
    kwt("C1", 7, "A missed chance", "If I had seen the email, I would have replied.", "HAD", "______ the email, I would have replied.", "Had I seen", "Inverted third conditional: Had + subject + past participle."),
    kwt("C1", 8, "A surprising win", "Nobody expected the team to win.", "CAME", "The team's win ______ everyone.", "came as a surprise to", "come as a surprise to someone."),
    kwt("C1", 9, "A legal warning", "They made me sign the form.", "WAS", "I ______ the form.", "was made to sign", "make + object + infinitive ⇔ passive be made to + infinitive.")
];
