/** @jsx Jsx */
var Jsx = require("j6pack")
var Page = require("../../page")
var {SchoolPage} = require("../read_page")
var {SchoolHeader} = require("../read_page")
var {Section} = Page
var {IdeaForm} = require("./create_page")

module.exports = function(attrs) {
	var {req} = attrs
	var {school} = attrs
	var {idea} = attrs
	var schoolUrl = "/schools/" + school.id

	return <SchoolPage
		page="update-idea"
		req={attrs.req}
		title={idea.title}
		school={school}
	>
		<SchoolHeader school={school}>
			<a href={schoolUrl} class="context">{school.name}</a>
			<h1>{idea.title}</h1>
		</SchoolHeader>

		<Section>
			<IdeaForm
				req={req}
				action={req.baseUrl + "/" + idea.id}
				method="put"
				id="account-form"
				school={school}
				idea={idea}
				submit={"Muuda ideed"}
			/>
		</Section>
	</SchoolPage>
}
