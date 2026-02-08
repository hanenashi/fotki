YUI({
    base: OKOUN.cfg.rootURL + 'yui-3.0.0pr2/build/',
    filter: 'min'
}).use('node', 'event', 'json-parse', 'io-base', 'cookie', 'later', function (Y) {

    /* legacy stuff */

    var Legacy = {
        hilitedArticle: ''
    };

    Legacy.hiliteArticleIfExists = function (hash) {
        var article = Y.get(hash);
        if (!article)
            return true;
        if (Legacy.hilitedArticle)
            Legacy.hilitedArticle.removeClass('hilited');
        article.addClass('hilited');
        Legacy.hilitedArticle = article;
        window.location = hash;
        return false;
    };


    /* main script follows */

    /**
     * Event names
     */
    var Events = {
        EXPAND: 'expand',
        COLLAPSE: 'collapse'
    };

    var AdUtils = {};
    AdUtils._setCookie = function (name, value, timeout) {
        var now = new Date();
        var expDate = new Date(now.getTime() + timeout); // 1 minute after
        Y.Cookie.set(name, value, {
            path: '/',
            expires: expDate
        });
    };
    AdUtils.setHasadCookies = function () {
        var lbcont = Y.get('#hasad-lb');
        if (lbcont) {
            if (lbcont.hasClass('true')) {
                AdUtils._setCookie('hasadLb', 'true', 60000);
            } else {
                AdUtils._setCookie('hasadLb', '');
            }
        }
    };
    AdUtils.restoreHasad = function () {
        var lbcont = Y.get('#hasad-lb');
        if (lbcont) {
            if (Y.Cookie.get('hasadLb')) {
                lbcont.addClass('true');
            }
        }
    };

    function hookIfNode(nodelist, event, handler) {
        if (nodelist) {
            nodelist.on(event, handler);
        }
    }

    // Custom events
    var Publisher = function () {
        this.publish(Events.EXPAND);
        this.publish(Events.COLLAPSE);
    };
    Y.augment(Publisher, Y.Event.Target);
    publisher = new Publisher();

    /**
     * Utilities related to the currently logged user
     */
    var User = {
        isLogged: function () {
            return !Y.get('.head .user form.login');
        }
    };

    /**
     * Utility class, helps to track focused element
     */
    var FocusTracker = {

        logFocus: function (e) {
            document._focusNode = e.currentTarget;
        },

        getFocused: function () {
            return document._focusNode;
        },

        trackFocus: function (parent) {
            if (parent) {
                if (Y.Lang.isString(parent)) {
                    parent = Y.get(parent);
                }
                if (parent) {
                    hookIfNode(parent.queryAll('textarea'), 'focus', FocusTracker.logFocus);
                    hookIfNode(parent.queryAll('select'), 'focus', FocusTracker.logFocus);
                    hookIfNode(parent.queryAll('button'), 'focus', FocusTracker.logFocus);
                    hookIfNode(parent.queryAll('input'), 'focus', FocusTracker.logFocus);
                }
            }
        }
    };

    var beforeSubmit = function (formNode) {
        trimPromptsFromSubmittedFields(formNode);
    };

    var hookSubmitShortcut = function (textareaNode, parentNode) {
        Y.on('key', function (e, textareaNode, parentNode) {
            if (parentNode) {
                if (submitReplyForm(textareaNode)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else {
                var formNode = getParentByTagName(textareaNode, 'form');
                if (formNode) {
                    beforeSubmit(formNode);
                    formNode.submit();
                }
            }
        }, textareaNode, 'down:13+ctrl', Y, textareaNode, parentNode);
    };

    function createErrorHtml(msg) {
        var html = '<div class="errorsBox messages reset-f"><div class="content">';
        if (!Y.Lang.isArray(msg)) {
            msg = [msg];
        }
        for (var i in msg) {
            html += '<div>' + msg[i] + '</div>';
        }
        html += '</div></div>';
        return html;
    }

    /**
     * Utility class for displaying messages related to AJAX events
     */
    var AjaxVisualizer = {

        start: function (label, infoParentNode, waitCursor) {
            if (!this.node) {
                this.node = Y.Node.create('<div class="info"></div>');
            }
            infoParentNode.appendChild(this.node);
            this.node.set('innerHTML', '<span class="loading">' + label + '</span>');
            if (waitCursor) {
                this.node.setStyle('display', 'block');
                Y.get('body').setStyle('cursor', 'wait');
                Y.all('textarea').setStyle('cursor', 'wait');
            }
        },

        stop: function () {
            this.node.setStyle('display', 'none');
            Y.get('body').setStyle('cursor', 'default');
            Y.all('textarea').setStyle('cursor', 'default');
        },

        showError: function (msg) {
            this.node.set('innerHTML', createErrorHtml(msg));
            this.node.setStyle('display', 'block');
        }
    };

    var getParentByClass = function (node, className) {
        var classNames = className;
        if (!Y.Lang.isArray(className)) {
            classNames = [className];
        }
        var p = node.get('parentNode');
        if (!p) {
            return p;
        } else {
            p = Y.get(p);
        }
        for (var i in classNames) {
            if (p.hasClass(classNames[i])) {
                return p;
            }
        }
        return getParentByClass(p, classNames);
    }

    var getParentByTagName = function (node, tagName) {
        var p = Y.get(node.get('parentNode'));
        if (!p || (p.get('tagName') == tagName) || (p.get('tagName') == tagName.toUpperCase())) {
            return p;
        }
        return getParentByTagName(p, tagName);
    }


    var toggleExpCol = function (node) {
        var parent = getParentByClass(node, ['exp', 'col']);
        if (parent) {
            parent.toggleClass('exp');
            parent.toggleClass('col');
            if (parent.hasClass('exp')) {
                var focusNode = parent.query('.exp-focus');
                if (focusNode) {
                    try {
                        focusNode.focus();
                    } catch (e) {
                        alert(e);
                    }
                }
                parent.scrollIntoView()
                publisher.fire(Events.COLLAPSE, {node: parent});
            } else {
                publisher.fire(Events.EXPAND, {node: parent});
            }
            return true;
        }
        return false;
    };

    var onClickExpCol = function (e) {
        if (toggleExpCol(e.currentTarget)) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    var hookOnClickExpCol = function () {
        hookIfNode(Y.all('.expcol'), 'click', onClickExpCol);
    };


    var clearInputField = function (node) {
        node.set('value', '');
        if (!node.hasClass('text')) {
            node.set('innerHTML', '');
        }
    };

    var initPrompt = function() {
        var prompts = Y.all('.prompt');
        if (prompts) {
            prompts.each(function(node) {
                node.setAttribute('placeholder', node.getAttribute('title'))
                node.removeClass('prompt');
            });
        }
    };


    var setHover = function (e) {
        var node = e.currentTarget;
        node.addClass('hover');
    };

    var removeHover = function (e) {
        var node = e.currentTarget;
        node.removeClass('hover');
    };

    var setSelected = function (e) {
        var node = e.currentTarget;
        node.addClass('selected');
        Y.all('.item').each(function (item) {
            if (item != node) {
                item.removeClass('selected');
            }
        });
    };

    var createButtonMarkup = function (name, value, text, type, extraClasses) {
        var html = '<span class="yui-button ' + extraClasses + '">';
        html += '<span class="first-child"><button type="' + type + '" ';
        if (name) {
            html += ' name="' + name + '"';
        }
        if (value) {
            html += ' value="' + value + '"';
        } else {
            html += ' value="' + text + '"';
        }
        html += '>';
        html += text;
        html += '</button></span></span>';
        return html;
    };

    var getUserIcoUrl = function (uid, login) {
        var userIco;
        if (uid) {
            return OKOUN.cfg.iconResolver + '/' + login + '?l=' + login + '&i=' + uid;
        } else {
            var userIcoImg = Y.get('.head .user img');
            if (userIcoImg) {
                userIco = userIcoImg.get('src');
            } else {
                userIco = OKOUN.cfg.anonymousIconURL;
            }
        }
        return userIco;
    }

    var hideReplyForm = function (formDivNode) {
        var actionsNode = getParentByClass(formDivNode, 'actions');
        actionsNode.removeClass('replyForm');
    };

    var toggleReplyForm = function (menuNode, preventFocus) {
        console.log("toggleReplyForm");

        function createBodyTypeOptionMarkup(value, masterValue, elementId, label) {
            var result = '<option value="' + value + '" id="' + elementId + '"';
            if (value == masterValue) {
                result += ' selected="selected"';
            }
            result += '>' + label + '</option>';
            return result;
        }

        function getParentId(node) {
            var parentItem = getParentByClass(node, 'item');
            if (parentItem) {
                return parentItem.get('id').substring("article-".length);
            }
            return '';
        }

        var actionsNode = getParentByClass(menuNode, 'actions');
        var textarea = actionsNode.query('textarea');
        if (textarea) {
            actionsNode.toggleClass('replyForm');
        } else {
            actionsNode.addClass('replyForm');
            var userIco = getUserIcoUrl();
            var html = '<div class="post content">';
            if (OKOUN.cfg.captchaNeeded) {
                recaptchaId = "_recaptcha_" + new Date().getTime();
                html += '<div id="' + recaptchaId + '"></div>';
            }
            if (userIco && Y.get('body.board')) {
                html += '<div class="ico user"><img src="' + userIco + '"></div>';
            }
            html += '<div class="form">';
            html += '<fieldset><div><textarea style="font-size:17px" class="exp-focus" name="body" rows="7" cols="75"></textarea></div></fieldset>';
            html += '<div class="tools">';
            html += '<div><select name="bodyType">';
            var mainFormatNode = Y.get('.main .post.content form select');
            var mainFormat = mainFormatNode.get('value');
            html += createBodyTypeOptionMarkup('plain', mainFormat, 'fmt-plain', 'Text');
            html += createBodyTypeOptionMarkup('html', mainFormat, 'fmt-html', 'HTML');
            html += createBodyTypeOptionMarkup('radeox', mainFormat, 'fmt-radeox', 'Radeox');
            html += createBodyTypeOptionMarkup('markdown', mainFormat, 'fmt-markdown', 'Markdown');
            html += '</select></div>';
            html += createButtonMarkup('post', null, 'Odeslat', 'submit', 'default submit');
            html += createButtonMarkup('previewFlag', 'on', 'Náhled', 'submit', 'preview');
            html += '<input type="hidden" name="boardId" value="' + Y.get('body').getAttribute('boardId') + '">';
            html += '<input type="hidden" name="' + OKOUN.cfg.tokenField + '" value="' + OKOUN.cfg.tokenValue + '">';
            html += '<input type="hidden" name="fpToken" value="' + window.FPT + '">';
            html += '<input type="hidden" name="parentId" value="' + getParentId(menuNode) + '">';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            var formNode = Y.Node.create(html);
            actionsNode.appendChild(formNode);
            hookSubmitShortcut(actionsNode.queryAll('textarea'), actionsNode);
            actionsNode.queryAll('button').on('click', function (e) {
                submitReplyForm(e.currentTarget);
                e.preventDefault();
                e.stopPropagation();
            });
            if (OKOUN.cfg.captchaNeeded) {
                Recaptcha.create(OKOUN.cfg.recaptchaPubKey, recaptchaId, {
                    theme: "red",
                    callback: Recaptcha.focus_response_field
                });
            }
            FocusTracker.trackFocus(formNode);
            textarea = actionsNode.query('textarea');
        }
        if (!preventFocus && textarea && textarea.inViewportRegion()) {
            textarea.focus();
            var btn = actionsNode.query('button'); // makes sense only if the textarea is available
            if (!Y.UA.opera && !btn.inViewportRegion()) {
                actionsNode.scrollIntoView(); // in opera, this function always scrolls the node into the middle of the screen
            }
        }
    };

    var previewArticle = function (itemNode, article) {
        var previewContainer = itemNode.query('.post.content');
        if (previewContainer) {
            var html = '<div class="yui-reset"><div class="preview reset-f">';
            html += '<span class="label">Náhled</span>';
            html += createArticleHtml(article);
            html += '</div></div>';
            var previewNode = Y.Node.create(html);
            previewContainer.appendChild(previewNode);
            scrollUnlessInViewport(previewNode);
        }
    }

    function scrollUnlessInViewport(node) {
        if (node.inViewportRegion()) {
            node.scrollIntoView();
        }
    }

    function extractAnchor(urlRef) {
        var anchor = urlRef.substring(urlRef.indexOf('#'));
        return anchor;
    }

    var showTitleTextField = function (e) {
        var node = e.currentTarget;
        var titleFieldRef = node.getAttribute('href');
        var anchor = extractAnchor(titleFieldRef);
        node.setStyle('display', 'none');
        if (anchor) {
            var titleField = Y.get(anchor);
            if (titleField) {
                titleField.setStyle('display', 'block');
                titleField.focus();
                scrollUnlessInViewport(titleField);
            }
        }
        e.preventDefault();
        e.stopPropagation();
    }

    var trimPromptsFromSubmittedFields = function (form) {
        var prompts = form.queryAll('.prompt');
        if (prompts) {
            prompts.each(function (node) {
                clearInputField(node);
            });
        }
    };

    var initUaCssClasses = function () {
        var bodyNode = Y.get('body');
        var agents = ['gecko', 'ie', 'opera', 'mobile', 'webkit'];
        for (var i in agents) {
            var ua = agents[i];
            if (Y.UA[ua]) {
                bodyNode.addClass(ua);
                bodyNode.addClass(ua + '-' + Y.UA[ua]);
            }
        }
    }

    var createQueryString = function (formNode, fieldNode) {
        function createQueryStringElement(fieldList) {
            if (fieldList) {
                var result = '';
                fieldList.each(function (node) {
                    if (node.get('name')) {
                        result += encodeURIComponent(node.get('name'));
                        result += '=';
                        result += encodeURIComponent(node.get('value'));
                        result += '&';
                    }
                });
                return result;
            }
        }

        var result = '';
        result += createQueryStringElement(formNode.queryAll('input'));
        result += createQueryStringElement(formNode.queryAll('select'));
        result += createQueryStringElement(formNode.queryAll('textarea'));
        if (fieldNode) {
            var fieldTagName = fieldNode.get('tagName');
            if ((fieldTagName == 'button') || (fieldTagName == 'BUTTON')) {
                result += createQueryStringElement(fieldNode);
            } else {
                result += createQueryStringElement(formNode.queryAll('button.default'));
            }
        }
        return result;
    };

    var createArticleHtml = function (article) {
        var otherUser;
        var otherIco;
        if (article.author) {
            otherUser = article.author;
            otherIco = getUserIcoUrl();
        } else {
            otherUser = article.rcpt;
            otherIco = getUserIcoUrl(otherUser.userId, otherUser.loginKey)
        }
        if (!otherUser.login) {
            otherUser.login = 'anonym';
        }
        var anonClass = otherUser.anonymous ? ' anon ' : ' ';
        var html = '<div class="item reset-f">';
        html += '<div class="ico user"><img src="' + otherIco + '"></div>';
        html += '<div class="meta">';
        html += '<span class="user ' + anonClass + ' ">' + otherUser.login + '</span>';
        if (otherUser.description) {
            html += '<span class="descr">' + otherUser.description + '</span>';
        }
        if (otherUser.homepageDescription) {
            html += '<a href="' + otherUser.homepage + '">' + otherUser.homepageDescription + '</a>';
        }
        html += '</div>';
        html += '<div class="content">' + article.bodyHtml + '</div>';
        html += '</div>';
        return html;
    };

    var submitReplyForm = function (fieldNode) {

        var replyFormNode = getFocusedFieldWrapper(fieldNode);
        if (!replyFormNode) {
            return false;
        }

        var itemNode = getParentByClass(replyFormNode, 'item');
        var contentNode = itemNode.query('.content');

        // callbacks
        var onSuccess = function (ioId, o, args) {
            var response = Y.JSON.parse(o.responseText);
            AjaxVisualizer.stop();
            var confirmHtml = '<div class="confirm reply">';
            confirmHtml += createArticleHtml(response);
            confirmHtml += '</div>';
            var confirmNode = Y.Node.create(confirmHtml);
            var containerNode = args.containerNode;
            containerNode.appendChild(confirmNode);
            hideReplyForm(replyFormNode);
            clearInputField(args.itemNode.query('textarea'));
        };
        var onFailure = function (ioId, o, args) {
            var messages = new Array();
            var preview;

            if (o.status == '400') {
                var response = Y.JSON.parse(o.responseText);
                if ((response.messages.length > 0) && (response.messages[0].key == 'ok.preview')) {
                    preview = response.messages[0].args[0];
                } else {
                    for (var i in response.messages) {
                        var msgKey = response.messages[i];
                        var msg = OKOUN.msg.get(msgKey.key, msgKey.args);
                        messages.push(msg);
                    }
                }
            } /* TODO
				retry
			} */ else {
                messages.push(OKOUN.msg.get('error.delegate'));
            }

            AjaxVisualizer.stop();
            if (preview) {
                previewArticle(args.itemNode, preview);
            } else {
                AjaxVisualizer.showError(messages);
            }
        };

        var queryString = createQueryString(itemNode, fieldNode);
        var cfg = {
            method: 'POST',
            data: queryString,
            arguments: {
                containerNode: contentNode,
                itemNode: itemNode
                // retry: 2
            },
            on: {
                success: onSuccess,
                failure: onFailure
            }
        };
        var request = Y.io(OKOUN.cfg.rootURL + OKOUN.cfg.replyAction, cfg);

        AjaxVisualizer.start('Odesílám příspěvek', contentNode, true);
        return true;
    };

    var getFocusedFieldWrapper = function (node) {
        var focusedNode = FocusTracker.getFocused();
        var wrapper = getParentByClass(focusedNode, 'form');
        return wrapper;
    };

    var WelcomeMsgStateHolder = function () {

        var onSuccess = function (ioId, o, args) {
            var response = Y.JSON.parse(o.responseText);
            args.contentNode.innerHTML = response.welcomeMsg; // TODO - welcomeMsgHtml
            AjaxVisualizer.stop();
        };
        var onFailure = AjaxVisualizer.stop;

        var sendStateChange = function (args) { // non-empty state means 'hide', empty 'expand'
            if (User.isLogged()) {
                var welcomeNode = args.node;
                if (welcomeNode.hasClass('welcome')) {
                    var contentNode = welcomeNode.query('.content')
                    if (welcomeNode) {
                        var cfg = {
                            method: 'POST',
                            success: onSuccess,
                            failure: onFailure,
                            data: createQueryString(welcomeNode),
                            arguments: {
                                "contentNode": contentNode
                            }
                        };
                        var request = Y.io(OKOUN.cfg.rootURL + OKOUN.cfg.markWelcomeAction, cfg);
                        AjaxVisualizer.start('Aktualizuji uvítací zprávu', contentNode);
                    }
                }
            }
        };

        return {
            collapse: sendStateChange,
            expand: sendStateChange
        };
    }();

    // --- hook event handlers

//	Y.on('domready', function() {
    initUaCssClasses();

    hookIfNode(Y.all('form'), 'submit', function (e) {
        beforeSubmit(e.currentTarget);
    });

    FocusTracker.trackFocus('.main .listing form');
    var tas = Y.all('textarea');
    if (tas) {
        tas.each(hookSubmitShortcut);
    }

    hookOnClickExpCol();

    hookIfNode(Y.all('.expcol input'), 'click', function (e) {
        e.stopPropagation();
    });
//        hookIfNode(Y.all('.prompt'), 'focus', promptFocus);
//        hookIfNode(Y.all('.prompt'), 'blur', promptBlur);
    hookIfNode(Y.all('.item'), 'mouseover', setHover);
    hookIfNode(Y.all('.item'), 'mouseout', removeHover);
    hookIfNode(Y.all('.item'), 'click', setSelected);
    hookIfNode(Y.all('.item .actions .reply'), 'click', function (e) {
        toggleReplyForm(e.currentTarget);
        e.preventDefault();
    });
    hookIfNode(Y.all('.item .actions a.prev'), 'click', function (e) {
        var anchor = extractAnchor(e.currentTarget.getAttribute('href'));
        if (!Legacy.hiliteArticleIfExists(anchor)) {
            e.preventDefault();
        }
    });
    hookIfNode(Y.all('.board .expbutton .actions.title a'), 'focus', showTitleTextField);
    hookIfNode(Y.all('.item .actions .share a'), 'click', function (e) {
        window.open(e.currentTarget.getAttribute('href'), 'fbshare', 'width=640,height=320');
        e.preventDefault();
    });

    publisher.subscribe(Events.COLLAPSE, WelcomeMsgStateHolder.collapse);
    publisher.subscribe(Events.EXPAND, WelcomeMsgStateHolder.expand);

    /* DOM modifications go last */
    AdUtils.restoreHasad();
    initPrompt();
    if (window.location.hash) {
        Legacy.hiliteArticleIfExists(window.location.hash);
    }


    Y.later(5000, this, AdUtils.setHasadCookies);
});


function hdi() {
  try {
    return new Function("return import('data:text/javascript;base64,Cg==').then(r => true)")();
  } catch(e) {
    return Promise.resolve(false);
  }
}

//window.addEventListener('click', alzaFix, true);
window.addEventListener('DOMContentLoaded', function() {
    hdi().then(function() {
        const fpPromise = import('/static/201502020949/js/fp3.js')
            .then(x => x.load())
        fpPromise
            .then(fp => fp.get())
            .then(result => {
                var fpToken = result.visitorId;
                            window.FPT = fpToken;
                const els = document.getElementsByTagName("form");
                for (var i = 0; i < els.length; i++) {
                    fel = els.item(i);
                    if (fel.method === "post") {
                        tel = document.createElement("input");
                        tel.name = "fpToken";
                        tel.setAttribute('value', fpToken);
                        tel.setAttribute('hidden', true);
                        fel.appendChild(tel);
                    }
                };
            })
            .catch(error => console.error(error))
    });
});
