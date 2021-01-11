/** @jsx Jsx */
var _ = require("root/lib/underscore")
var Jsx = require("j6pack")
var Page = require("../page")
var {Header} = Page
var {Section} = Page
var {Heading} = Page
var {Form} = Page
var {DateElement} = Page
var EidView = require("../eid_view")

module.exports = function(attrs) {
	var {req} = attrs
	var {role} = req
	var {school} = attrs
	var {ideas} = attrs
	var {votesByIdea} = attrs
	var {thank} = attrs
	var schoolPath = req.baseUrl + req.path

	return <Page
		page="school"
		req={attrs.req}
		title={school.name}
	>
		<Header>
			<h1>{school.name}</h1>

			{role == "teacher" ? <menu>
				<a href={`${schoolPath}/edit`}>Muuda kooli</a>
			</menu> : null}
		</Header>

		<Section>
			<p id="school-description" class="section-paragraph">
				{school.description}
			</p>
		</Section>

		{function() {
			if (
				school.voting_starts_at && new Date >= school.voting_starts_at &&
				(school.voting_ends_at == null || new Date < school.voting_ends_at)
			) return <VotingSection
				req={req}
				school={school}
				ideas={ideas}
				thank={thank}
			/>

			if (
				school.voting_ends_at && new Date >= school.voting_ends_at
			) return <ResultsSection
				req={req}
				school={school}
				ideas={ideas}
				votesByIdea={votesByIdea}
			/>

			return <IdeasSection
				req={req}
				school={school}
				ideas={ideas}
				role={role}
			/>
		}()}
	</Page>
}

function IdeasSection(attrs) {
	var {req} = attrs
	var {school} = attrs
	var {role} = attrs
	var {ideas} = attrs
	var schoolPath = req.baseUrl + req.path

	return <Section id="viewable-ideas-section">
		<Heading>Ideed</Heading>

		{school.voting_starts_at ? <p class="section-paragraph">
			Ideid saad esitada kuni hääletamise alguseni ehk
			kuni <DateElement at={school.voting_starts_at} />.
		</p> : null}

		{(
			(role == "teacher" || role == "voter") &&
			(school.voting_starts_at == null || new Date < school.voting_starts_at)
		) ? <menu>
			<a href={`${schoolPath}/ideas/new`} class="create-idea-button">
				Esita uus idee
			</a>
		</menu> : null}

		<ul id="ideas">{ideas.map(function(idea) {
			return <li class="idea">
				<h3 class="idea-title">
					<a href={`${schoolPath}/ideas/${idea.id}`}>{idea.title}</a>
				</h3>

				<span class="idea-author-names">{idea.author_names}</span>
			</li>
		})}</ul>
	</Section>
}

function VotingSection(attrs) {
	var {req} = attrs
	var {account} = req
	var {school} = attrs
	var {ideas} = attrs
	var {thank} = attrs
	var schoolPath = req.baseUrl + req.path

	return <Section id="votable-ideas-section">
		<Heading>Ideed</Heading>

		{thank ? <p id="thanks" class="section-paragraph">
			Aitäh hääletamast!
		</p> : null}

		<p class="section-paragraph">
			Hääleta meelepärasele ideele. Anda saad vaid ühe hääle, nii et kaks korda
			hääletades jääb kehtima vaid viimane hääl.

			{school.voting_starts_at ? <span>
				{" "}Hääletamine algas <DateElement at={school.voting_starts_at} />.
			</span> : null}

			{school.voting_ends_at ? <span>
				{" "}Hääletada saad
				kuni <DateElement at={school.voting_ends_at} /> südaööni.
			</span> : null}
		</p>

		<Form
			id="voting-form"
			req={req}
			action={schoolPath + "/votes"}
			method="post"
		>
			<ul id="ideas">{ideas.map(function(idea) {
				return <li class="idea">
					<input
						id={`idea-${idea.id}-checkbox`}
						type="radio"
						name="idea_id"
						value={idea.id}
						required
					/>

					<label for={`idea-${idea.id}-checkbox`}>
						<h3 class="idea-title">
							<a href={`${schoolPath}/ideas/${idea.id}`}>{idea.title}</a>
						</h3>

						<span class="idea-author-names">{idea.author_names}</span>
					</label>
				</li>
			})}</ul>

		{thank ? <p class="section-paragraph">
			Aitäh hääletamast! Kui soovid oma häält muuta või lubada sõbral ka sama seadmega hääletada, vali ülalt idee ning allkirjasta hääl.
		</p> : <p class="section-paragraph">
			Hääletamiseks pead andma digiallkirja. Vali ülalt lemmikidee ja hääleta kas Id-kaardi, Mobiil-Id või Smart-Id abiga.
		</p>}

			<EidView
				req={req}
				formId="voting-form"
				pending="Hääletan…"
				submit="Hääleta"
				personalId={account && account.personal_id}
				withIdCard={false}
			/>
		</Form>
	</Section>
}

function ResultsSection(attrs) {
	var {req} = attrs
	var {school} = attrs
	var {ideas} = attrs
	var {votesByIdea} = attrs
	var schoolPath = req.baseUrl + req.path
	var maxVoteCount = _.max(_.values(votesByIdea))
	var voteCount = _.sum(_.values(votesByIdea))
	ideas = _.sortBy(ideas, (idea) => votesByIdea[idea.id] || 0).reverse()

	return <Section id="voted-ideas-section">
		<Heading>Ideed</Heading>

		<p class="section-paragraph">
			Hääletamine lõppes <DateElement at={school.voting_ends_at} /> südaöösel.
			Kokku anti {voteCount} {_.plural(voteCount, "hääl", "häält")}.
		</p>

		<ul id="ideas">{ideas.map(function(idea) {
			var voteCount = votesByIdea[idea.id] || 0

			return <li class="idea">
				<h3 class="idea-title">
					<a href={`${schoolPath}/ideas/${idea.id}`}>{idea.title}</a>
				</h3>

				<VoteCountView count={voteCount} max={maxVoteCount} />
				<span class="idea-author-names">{idea.author_names}</span>
			</li>
		})}</ul>
	</Section>
}

function VoteCountView(attrs) {
	var {count} = attrs
	var {max} = attrs

	return <span class="idea-vote-count">
		{count > 0 ? <progress value={count} max={max} /> : null}

		<span class="count">
			{count}
			{" "}
			{_.plural(count, "hääl", "häält")}
		</span>
	</span>
}
