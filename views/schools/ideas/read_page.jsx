/** @jsx Jsx */
var Jsx = require("j6pack")
var Page = require("../../page")
var {SchoolPage} = require("../read_page")
var {SchoolHeader} = require("../read_page")
var {Section} = Page
var linkify = require("root/lib/linkify")

module.exports = function(attrs) {
	var {req} = attrs
	var {account} = req
	var {school} = attrs
	var {idea} = attrs
	var ideaPath = req.baseUrl + "/" + idea.id

	return <IdeaPage
		req={req}
		school={school}
		idea={idea}
		editable={
			account &&
			idea.account_id == account.id &&
			(school.voting_starts_at == null || new Date < school.voting_starts_at)
		}
	>
		<Section>
			<p id="idea-description" class="section-paragraph">
				{idea.image_type ? <img src={ideaPath + "/image"} /> : null}

				{Jsx.html(linkify(idea.description))}
			</p>
		</Section>
	</IdeaPage>
}

function IdeaPage(attrs, children) {
	var {school} = attrs
	var {idea} = attrs
	var {editable} = attrs
	var schoolUrl = "/schools/" + school.id
	var ideaPath = schoolUrl + "/ideas/" + idea.id

	return <SchoolPage
		page="idea"
		req={attrs.req}
		title={idea.title}
		school={school}
	>
		<SchoolHeader school={school}>
			<a href={schoolUrl} class="context">{school.name}</a>
			<h1>{idea.title}</h1>
			<span class="subtitle author-names">{idea.author_names}</span>

			{editable ? <menu>
				<a href={`${ideaPath}/edit`}>Muuda ideed</a>
			</menu> : null}
		</SchoolHeader>

		{children}
	</SchoolPage>
}
