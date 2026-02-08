OKOUN.msg = {};
OKOUN.msg.get = function(key, args) {
	var val = OKOUN.msg.messages[key];
	if (args) {
		for (var i in args) {
			var tpl = '{' + i + '}';
			var subst = args[i];
			val = val.replace(tpl, subst);
		}
	}
	return val;
}

OKOUN.msg.messages = {};
OKOUN.msg.messages['error.access.topic.create.parent']='Nemáte právo vytvářet na zvoleném místě nová témata, nabízíme Vám aspoň přehled témat, kde nová podtémata vytvářet smíte';
OKOUN.msg.messages['error.login']='Neplatné přihlašovací jméno nebo heslo';
OKOUN.msg.messages['error.permission']='K této operaci nemáte dostatečná práva';
OKOUN.msg.messages['error.article.html.attr.name']='Vaše HTML obsahuje chybné nebo na Okounu nepovolené atributy:<br><br><code>  {0} <span class="bad_html">{1}</span>{2}</code>';
OKOUN.msg.messages['error.board.anonPostLimit']='Vas prispevek je delsi, nezli je v tomto klubu dovoleno anonymum';
OKOUN.msg.messages['error.access.board.update']='Nemáte právo měnit nastavení klubu <a href="{0}">{1}</a>';
OKOUN.msg.messages['error.articles.delete.none']='Namáte zvolen žádný příspěvek ke smazání. Takže holt nic nemažu ';
OKOUN.msg.messages['error.access.myBoards']='Jakožto nepřihlášený uživatel nemáte přístup k seznamu svých klubů';
OKOUN.msg.messages['error.privmsg.body.required']='Váš vzkaz je prázdný, což by se mohlo negativně podepsat na jeho srozumitelnosti';
OKOUN.msg.messages['error.access.updatebox']='Jakožto nepřihlášený uživatel nemáte přístup k uživatelským nastavením';
OKOUN.msg.messages['error.unsupported.format.html']='Zasílání HTML zatím není v&nbsp;této verzi Okouna podporováno. Bude líp!';
OKOUN.msg.messages['error.access.board.create.topic']='Nemáte právo vytvářet na zvoleném místě nové kluby';
OKOUN.msg.messages['error.delegate']='Omlouváme se, ale zdá se, že na Okounu došlo k technickým potížím. Zkuste to prosím za chvíli znovu.';
OKOUN.msg.messages['error.board.create.topicId.notExist']='Takove tema bohuzel neexistuje, vyberte si jine z nabidky.';
OKOUN.msg.messages['error.access.board.read']='Nemáte právo číst tento klub';
OKOUN.msg.messages['error.postOnly']='Tuto akci je možné provést pouze za pomocí formuláře typu POST.';
OKOUN.msg.messages['error.access.article.create.board']='V tomto klubu nemáte povoleno zasílat diskusní příspěvky';
OKOUN.msg.messages['error.privmsg.rcpt.required']='Je potřeba uvést, komu má být Váš vzkaz doručen. Jinak by logicky nemohl být doručen nikomu.';
OKOUN.msg.messages['error.search.noSuchUsers.listed']='Následující uživatelé v našem systému neexistují:';
OKOUN.msg.messages['error.board.create.postLimitLessZero']='Omezeni delky prispevku pro registrovane uzivatele musi byt nezaporne';
OKOUN.msg.messages['error.user.none']='Takový uživatel neexistuje.';
OKOUN.msg.messages['error.board.create.anonPostLimitLessZero']='Omezeni delky prispevku pro anonymni uzivatele musi byt nezaporne';
OKOUN.msg.messages['error.article.badkey']='Zdá se, že jste právě do tohoto klubu omylem zaslal příspěvek. Pokud to za omyl nepovažujete, odešlete prosím formulář ještě jednou kliknutím na tlačítko &quot;odeslat&quot;. Nepokoušejte se proti této chybové zprávě bojovat opakovaným obnovováním stránky, unavíte se.<br />Tato zpráva na vás mohla vyskočit i pokud máte tento klub otevřen ve více oknech - je-li tomu tak, omlouváme se za komplikace.';
OKOUN.msg.messages['error.messages.delete.none']='Namáte zvolen žádný příspěvek ke smazání. Takže holt nic nemažu ';
OKOUN.msg.messages['error.access.favourites']='Jakožto nepřihlášený uživatel nemáte přístup k seznamu oblíbených klubů';
OKOUN.msg.messages['error.article.html.unexpectedEnd']='Vaše HTML obsahuje neuzavřené značky... asi byl odeslán předčasně:<br><br><code> {0} <span class="bad_html">{1}</span>{2}</code>';
OKOUN.msg.messages['error.article.html.attr.value']='Vaše HTML obsahuje chybné nebo na Okounu nepovolené hodnoty atributů:<br><br><code> {0} <span class="bad_html"> {1}</span> {2}</code>';
OKOUN.msg.messages['error.access.board.create.anon']='Nemáte právo zakládat nové kluby. Zkuste se nejdříve přihlásit či zaregistrovat, třeba to pak bude lepší...';
OKOUN.msg.messages['error.access.topic.update']='Nemáte právo měnit nastavení tématu';
OKOUN.msg.messages['error.article.html']='Vaše HTML není akceptovatelné. Více Vám k tomu nejsem schopen zjistit.:<br><br><code> {0} <span class="bad_html"> {1}</span> {2}</code>';
OKOUN.msg.messages['error.topic.none']='Požadované téma neexistuje. Co takhle začít od <a href="/">úvodní stránky</a>?';
OKOUN.msg.messages['error.access.noMyBoards']='Nic nového nebo vlastního';
OKOUN.msg.messages['error.access.nofavourites']='Nic nového nebo oblíbeného';
OKOUN.msg.messages['error.article.html.tag.name']='Vaše HTML obsahuje chybné nebo na Okounu nepovolené značky:<br><br><code> {0} <span class="bad_html">{1}</span>{2}</code>';
OKOUN.msg.messages['error.access.msgbox']='Jakožto nepřihlášený uživatel nemáte přístup k soukromému vzkazníku';
OKOUN.msg.messages['error.access.board.create']='Nemáte právo zakládat nové kluby';
OKOUN.msg.messages['error.article.html.single']='Vaše HTML obsahuje párový tag použitý jako nepárový:<br><br><code> {0} <span class="bad_html">{1}</span>{2}</code>';
OKOUN.msg.messages['error.access.topic.create']='Nemáte právo vytvářet nová témata';
OKOUN.msg.messages['error.board.postLimit']='Vas prispevek je delsi, nezli je v tomto klubu dovoleno';
OKOUN.msg.messages['error.board.none']='Diskusní klub odpovídající Vašemu požadavku neexistuje.';
OKOUN.msg.messages['error.board.create.duplicate']='Diskusní klub s podobným názvem už na Okounu máme, zkuste být prosím trochu kreativnější';
OKOUN.msg.messages['error.article.html.endtag.name']='Vaše HTML obsahuje chybnou uzavírací značku:<br><br><code>{0} <span class="bad_html">{1}</span>{2}</code>';
OKOUN.msg.messages['error.topic.parentIdisTopicId']='Nelze zařadit klub pod sebe sama';
OKOUN.msg.messages['error.article.body.required']='Váš příspěvek je prázdný, což by se mohlo negativně podepsat na jeho srozumitelnosti';

OKOUN.msg.messages['recaptcha.legend']='Dokažte, že jste člověk!';
OKOUN.msg.messages['recaptcha.instructions_visual']='Opište seshora obě slova:';
OKOUN.msg.messages['recaptcha.instructions_audio']='Opište slova, která uslyšíte:';
OKOUN.msg.messages['recaptcha.play_again']='Přehrát znovu';
OKOUN.msg.messages['recaptcha.cant_hear_this']='Nic neslyším, stáhnout MP3';
OKOUN.msg.messages['recaptcha.visual_challenge']='Opsat psaný text';
OKOUN.msg.messages['recaptcha.audio_challenge']='Opsat mluvené slovo';
OKOUN.msg.messages['recaptcha.refresh_btn']='Vygenerovat jiný text';
OKOUN.msg.messages['recaptcha.help_btn']='Nápověda';
OKOUN.msg.messages['recaptcha.incorrect_try_again']='Špatně, zkuste to znovu';

OKOUN.msg.messages['recaptcha.not_initalized']='Zkuste se prosím na chvíli zastavit.';
OKOUN.msg.messages['recaptcha.validation_error']='Špatně opsaná slova, nejste náhodou robot? Pokud ne, zkuste to prosím znova.';