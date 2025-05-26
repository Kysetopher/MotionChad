import React, {useEffect, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import { StatusButtonField, ItineraryItem, ActionItem, TimelineDate, RenderData, TaskItem } from './insightField'
const InsightDisplay = ({ insight }) => {
  const { isBelowTablet, ReverieManager } = useGeneralContext();
  const [insightData, setInsightData] = useState([]);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    try {
      const parsed = JSON.parse(insight?.insight || 'null');
      if (parsed) {
        setInsightData({ ...parsed });
      } else {
        setInsightData([]);
        console.log("Parsed is null or unexpected:", parsed);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      setInsightData([{ Error: `Invalid JSON:${insight?.insight}` }]);
    }
  }, [insight]);

  const Title = ({ title, subtitle }) => {
    const renderSubtitle = (sub) => {
      // If subtitle is a valid date/time string, show it as "Scheduled:"
      if (typeof sub === "string" && !isNaN(Date.parse(sub))) {
        return (
          <div className="insight-subtitle">
            <strong>Scheduled: </strong>
            {new Date(sub).toLocaleString()}
          </div>
        );
      }
      return <div className="insight-subtitle">{sub}</div>;
    };

    return (
      <>
        <div
          className="insight-title-options"
          data-category={insight.category}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <div className="col-9 col-md-6">
            <div className="insight-title">{title}</div>
            {(collapsed || isBelowTablet === false) && subtitle && renderSubtitle(subtitle)}
          </div>

          {(!collapsed || isBelowTablet === false) && (
            <div className="col-3 col-md-6 insight-action-container">
               {insightData.status && <StatusButtonField data={insightData.status}/>}
              <img
                onClick={(e) => {
                  e.stopPropagation();
                  ReverieManager.deleteInsight(insight.id);
                }}
                className="insight-action"
                src="icon/block-trashcan.svg"
                alt="Delete"
              />
             
            </div>
          )}
        </div>
      </>
    );
  };


  const Body = ({ data }) => {
    return (
      <div className="insight-body-options">
        {data.map((item, index) => item && <div key={index}>{RenderData(item)}</div>)}

        {insightData.notes && (
          <section>
            <div>{insightData.notes}</div>
          </section>
        )}
      </div>
    );
  };

  if (!insightData || Object.keys(insightData).length === 0) return null;

  let bodyData = [];

  switch (insight.category) {
    case "user-information": {
      bodyData = [
        { "Names": insightData.names },
        { "Nicknames": insightData.nicknames },
        { "Bio": insightData.bio },
        { "Gender": insightData.gender },
        { "Age": insightData.age },
        { "Email": insightData.email },
        { "Date of Birth": insightData.date_of_birth },
        { "Addresses": insightData.addresses },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
           title={(Array.isArray(insightData.nicknames) && insightData.nicknames.length > 0)
            ? insightData.nicknames[0]
            : insightData.names}
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "agent-behavior-custom-instructions": {
      bodyData = [
        { "Desired Agent Behaviors": insightData.desired_agent_behaviors },
        { "Undesired Agent Behaviors": insightData.undesired_agent_behaviors },
        { "Custom Instructions": insightData.custom_instructions },
        { "Tone Preferences": insightData.tone_preferences },
        { "Confidence Thresholds": insightData.confidence_thresholds },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Agent Customization"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "dates-calendar-planner-schedule": {
      const scheduleArray = Array.isArray(insightData.agenda)
        ? insightData.agenda
        : (insightData.agenda ? [insightData.agenda] : []);

      bodyData = [
        { "Schedule Item": insightData.schedule_item },
        { "Recurrence": insightData.recurrence },
        { "Objective": insightData.objective },
        { "Location": insightData.location },
        {
          "Agenda": scheduleArray.length > 0 && (
            <div className="object-array-field">
              {scheduleArray.map((agendaItem, index) => (
                <ActionItem key={index} data={agendaItem} />
              ))}
            </div>
          )
        },
        { "Participants": insightData.participants },
      ].filter((item) => Object.values(item)[0] != null);

      const dateTimeSubtitle = insightData.date_time || "";
      const durationSubtitle = insightData.duration ? ` - ${insightData.duration}` : "";

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.schedule_item}
            subtitle={`${dateTimeSubtitle} (${durationSubtitle})`}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }


    case "reminders": {
      bodyData = [
        { "Triggers": insightData.triggers },
        { "Frequency": insightData.frequency },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.reminder}
            subtitle={insightData.date_time}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "food-cooking-cuisine-dietary-nutrition": {
      bodyData = [
        { "Meal Planning": insightData.meal_planning },
        { "Favorite Cuisines": insightData.favorite_cuisines },
        { "Foods to Avoid": insightData.foods_to_avoid },
        { "Prefered Ingredients": insightData.prefered_ingredients },
        { "Health Restrictions": insightData.health_restrictions },
        { "Nutritional Profile": insightData.nutritional_profile },
        { "Recipes": insightData.recipes },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Food Preferences"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "movies-tv-anime": {
      bodyData = [
        { "Movies Watched": insightData.movies_watched },
        { "Movie Watch Queue": insightData.movie_watch_queue },
        { "TV Shows Watched": insightData.tv_shows_watched },
        { "TV Shows Watch Queue": insightData.tv_shows_watch_queue },
        { "Animes Watched": insightData.animes_watched },
        { "Anime Watch Queue": insightData.anime_watch_queue },
        { "Favorite Actors": insightData.favorite_actors },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Movie Collection"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "books-audiobooks": {
      bodyData = [
        { "Currently Reading": insightData.currently_reading },
        { "Reading Queue": insightData.reading_queue },
        { "Books Read": insightData.books_read },
        { "Mangas": insightData.mangas },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="My Library"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "projects": {
      const statusPart = insightData.status ? ` | Status: ${insightData.status}` : "";
      bodyData = [
        { "Core Objective": insightData.core_objective },
        { "Tasks": insightData.tasks && (
          <div className="object-array-field">
            {insightData.tasks.map((taskItem, index) => (
              <TaskItem key={index} data={taskItem} />
            ))}
          </div>
        )},
        { "Target Audience": insightData.target_audience },
        { "Timeline & Important Dates": insightData.timeline_important_dates && (
          <div className="object-array-field">
            {insightData.timeline_important_dates.map((date, index) => (
              <TimelineDate key={index} data={date} />
            ))}
          </div>
        )},
        { "Budget": insightData.budget },
        { "Summary": insightData.project_summary },
        { "Status": insightData.statusPart },
        { "Scope": insightData.scope },
        { "Technologies": insightData.technologies },
        { "Stakeholders": insightData.stakeholders },
        { "Requirements": insightData.requirements },
        { "Deliverable": insightData.deliverable },
        { "Useful Links": insightData.useful_links },
        { "Documentation": insightData.documentation },
      ].filter((item) => Object.values(item)[0] != null);

      const subtitleValue = insightData.project_summary
        ? `${insightData.project_summary}${statusPart}`
        : (statusPart || "");

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.project_name}
            // subtitle={subtitleValue}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "lectures": {
      bodyData = [
        { "Audited Lectures": insightData.audited_lectures },
        { "Currently Attending": insightData.currently_attending },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="My Lectures"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "games-gaming": {
      bodyData = [
        { "Games": insightData.games },
        { "Preferred Platforms": insightData.preferred_platforms },
        { "Favorite Genres": insightData.favorite_genres },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Gaming Preferences"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "event-hosting": {
      const locationPart = insightData.location ? `, ${insightData.location}` : "";
      bodyData = [
        { "Type": insightData.type },
        { "Registration & Ticketing Details": insightData.registration_and_ticketing_details },
        { "Theme": insightData.theme },
        { "Date / Time": insightData.date_time },
        { "Location": insightData.location },
        { "Audience": insightData.audience },
        { "Agenda": insightData.agenda },
        { "Budget": insightData.budget },
        { "Sponsors": insightData.sponsors },
        { "Partners": insightData.partners },
        { "Capacity": insightData.capacity },
        { "Collaborators": insightData.collaborators },
        { "Branding & Marketing": insightData.branding_marketing },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.concept}
            subtitle={insightData.date_time}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "event-attending": {
      const locationPart = insightData.location ? `, ${insightData.location}` : "";
      bodyData = [
        { "Registration": insightData.registration },
      ].filter((item) => Object.values(item)[0] != null);

      const subtitleValue = insightData.date_time
        ? `${insightData.date_time}${locationPart}`
        : `${locationPart}`;

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.event_name}
            subtitle={subtitleValue}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "research-interests-curiosity": {
      const curiosityArray = Array.isArray(insightData.subjects_of_curiosity)
        ? insightData.subjects_of_curiosity
        : (insightData.subjects_of_curiosity ? [insightData.subjects_of_curiosity] : []);

      bodyData = [
        {
          "Subjects of Curiosity": curiosityArray.length > 0 && (
            <div className="object-array-field">
              {curiosityArray.map((curiosityItem, index) => (
                <ActionItem key={index} data={curiosityItem} />
              ))}
            </div>
          )
        }
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="My Curiosities"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "writing-stories": {
      bodyData = [
        { "Plot": insightData.plot },
        { "Theme": insightData.theme },
        { "Tone": insightData.tone },
        { "Style": insightData.style },
        { "Characters": insightData.characters },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.concept}
            subtitle={insightData.theme}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "song-writer": {
      bodyData = [
        { "Lyrics": insightData.lyrics },
        { "Genre": insightData.genre },
        { "Instruments": insightData.instruments },
        { "BPM / Tempo": insightData.bpm_tempo },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.concept}
            // subtitle={insightData.themes}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "personal-contacts-relationships": {
      const subtitleValue = [
        insightData.phone ? insightData.phone : "",
        insightData.email ? insightData.email : "",
      ]
        .filter((v) => v)
        .join(" | ");

      bodyData = [
        { "Relationship": insightData.relationship },
        { "Bio": insightData.bio },
        { "Locations": insightData.locations },
        { "Social Media Accounts": insightData.social_media_accounts },
        { "Mutual Interests": insightData.mutual_interests },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.full_name}
            subtitle={subtitleValue}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "travel-plans": {

      bodyData = [
        { "Travel Wishlist": insightData.travel_wishlist },
        { "Visited": insightData.visited },
        { "Travel Itinerary": insightData.travel_itinerary && (
          <div className="object-array-field">
              {insightData.travel_itinerary.map((itineraryItem, index) => (
                <ItineraryItem key={index}  data={itineraryItem} />
              ))}
            </div>
        )},
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Travel Log"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
       
        </div>
      );
    }

    case "geographic-location": {
      bodyData = [
        { "Locations": insightData.locations },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Location History"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "physical-fitness-exercise": {
      bodyData = [
        { "Workout Plan": insightData.workout_plan },
        { "Physique": insightData.physique },
        { "Lifestyle": insightData.lifestyle },
        { "Physical Goals": insightData.physical_goals },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="My Workout Plan"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "health-sleep-medicine": {
      bodyData = [
        { "Health Challenges": insightData.health_challenges },
        { "Healthcare Providers": insightData.healthcare_providers },
        { "Insurance Coverage": insightData.insurance_coverage },
        { "Allergies & Interactions": insightData.allergies_interactions },
        { "Family Medical History": insightData.family_medical_history },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Physical Health"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "mental-health-emotional-wellbeing": {
      bodyData = [
        { "Challenges": insightData.challenges },
        { "Traumas": insightData.traumas },
        { "Mental Health Goals": insightData.mental_health_goals },
        { "Emotional Health": insightData.emotional_health },
        { "Emotional Regulation Techniques": insightData.emotional_regulation_techniques },
        { "Stress Management": insightData.stress_management },
        { "Support System": insightData.support_system },
        { "Challenges or Breakthroughs": insightData.challenges_or_breakthroughs },
        { "Stressors Faced": insightData.stressors_faced },
        { "Mindset": insightData.mindset_towards_recovery_or_growth },
        { "Specific Phobias": insightData.specific_phobias },
        { "Anxiety Triggers": insightData.anxiety_triggers },
        { "Coping Mechanisms": insightData.coping_mechanisms },
        { "Therapy Details": insightData.therapy_details },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Mental Health"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "financial-planning": {
      bodyData = [
        { "Income Sources": insightData.income_sources },
        { "Financial Concerns": insightData.financial_concerns },
        { "Budget & Savings": insightData.budget_savings },
        { "Financial Goals": insightData.financial_goals },
        { "Investments": insightData.investments },
        { "Banking Information": insightData.banking_information },
        { "Retirement Plan": insightData.retirement_plan },
        { "Subscriptions": insightData.subscriptions },
        { "Debt & Liabilities": insightData.debt_and_liabilities },
        { "Credit Score": insightData.credit_score },
        { "Insurance Policies": insightData.insurance_policies },
        { "Tax Obligations & Strategies": insightData.tax_obligations_and_strategies },
        { "Estate Planning": insightData.estate_planning },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Financials"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "language-preferences-proficiency": {
      const proficiencyData = insightData.language_proficiency;

      bodyData = [
        { "Language Proficiency": insightData.language_proficiency },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Languages"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "social-cultural-identity": {
      bodyData = [
        { "Cultural Background": insightData.cultural_background },
        { "Personal Beliefs": insightData.personal_beliefs },
        { "Social Norms": insightData.social_norms },
        { "Religious Beliefs": insightData.religious_beliefs },
        { "Spiritual Practices": insightData.spiritual_practices },
        { "Cultural Lineage": insightData.cultural_lineage },
        { "Family Heritage": insightData.family_heritage },
        { "Regional Traditions": insightData.regional_traditions },
        { "Ethnic Identity": insightData.ethnic_identity },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.religious_beliefs || ""}
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "introspection-reflections-values-principles": {
      bodyData = [
        { "Core Beliefs": insightData.core_beliefs },
        { "Principles": insightData.principles },
        { "Life Philosophy": insightData.life_philosophy },
        { "Guiding Values": insightData.guiding_values },
        { "Self Perception": insightData.self_perception },
        { "Introspection": insightData.introspection },
        { "Reflections": insightData.reflections },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Deep Introspection"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "art-imagery": {
      bodyData = [
        { "Image Description": insightData.image_description },
        { "Style": insightData.style },
        { "Color Palette": insightData.color_palette },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.concept}
            subtitle={insightData.theme}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "news-current-affairs": {
      bodyData = [
        { "Areas of Interest": insightData.areas_of_interest },
        { "Preferred News Sources": insightData.preferred_news_sources },
        { "Excluded News Sources": insightData.excluded_news_sources },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="News Preferences"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "humor-comedy-inside-humor": {
      bodyData = [
        { "Humor Style": insightData.humor_style },
        { "Inside Jokes": insightData.inside_jokes },
        { "Favorite Comedians": insightData.favorite_comedians },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Humor Profile"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "personality-traits-motivations": {
      bodyData = [
        { "Personality Indicators": insightData.personality_indicators },
        { "Strengths": insightData.strengths },
        { "Weaknesses": insightData.weaknesses },
        { "Motivational Factors": insightData.motivational_factors },
        { "Values That Drive Behavior": insightData.values_that_drive_behavior },
        { "Openness to New Experiences": insightData.openness_to_new_experiences },
        { "Temperament": insightData.temperament },
        { "Emotional Intelligence": insightData.emotional_intelligence },
        { "Social Orientation": insightData.social_orientation },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Personality"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "hobbies-habits-leisure": {
      const hobbiesArray = Array.isArray(insightData.hobbies)
        ? insightData.hobbies
        : (insightData.hobbies ? [insightData.hobbies] : []);

      bodyData = [
        {
          "Hobbies": hobbiesArray.length > 0 && (
            <div className="object-array-field">
              {hobbiesArray.map((hobbyItem, index) => (
                <ActionItem key={index} data={hobbyItem} />
              ))}
            </div>
          )
        },
        { "Preferred Leisure Activities": insightData.preferred_leisure_activities },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="My Hobbies"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "philosophical-ideological-existential": {
      bodyData = [
        { "Existential Questions or Beliefs": insightData.existential_questions_or_beliefs },
        { "Philosophical Inclinations": insightData.philosophical_inclinations },
        { "Meaning": insightData.meaning },
        { "Philosophical Viewpoints": insightData.philosophical_viewpoints },
        { "Personal Ideologies": insightData.personal_ideologies },
        { "Purpose": insightData.purpose },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Philosophical Inclinations"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "decision-making-styles": {
      bodyData = [
        { "Analytical vs Intuitive": insightData.analytical_vs_intuitive },
        { "Risk Tolerance": insightData.risk_tolerance },
        { "Influencing Factors": insightData.influencing_factors },
        { "Decision Making Approach": insightData.decision_making_approach },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Decision Style"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "pets": {
      bodyData = [
        { "Species": insightData.species },
        { "Age": insightData.age },
        { "Medical Records": insightData.medical_records },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Pets"
            subtitle={insightData.pet_name || ""}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "pets-animals": {
      bodyData = [
        { "Favorite Outdoor Activities": insightData.favorite_outdoor_activities },
        { "Favorite Animals": insightData.favorite_animals },
        { "Conservation Efforts": insightData.conservation_efforts },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Pets and Animals"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "appearance-personal-style": {
      bodyData = [
        { "Clothing & Fashion": insightData.clothing_fashion },
        { "Grooming Habits": insightData.grooming_habits },
        { "Favorite Brands or Trends": insightData.favorite_brands_or_trends },
        { "Personal Style Statement": insightData.personal_style_statement },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Fashion"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "community-membership": {
      bodyData = [
        { "Community Membership": insightData.community_membership },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="My Communities"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "memories-life-events": {
      bodyData = [
        { "Early Memories": insightData.early_memories },
        { "Significant Life Events": insightData.significant_life_events },
        { "Emotional Attachments": insightData.emotional_attachments },
        { "Transformative Experiences": insightData.transformative_experiences },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="My Memories"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "personal-growth-accountability-aspirations": {
      bodyData = [
        { "Self Improvement Goals": insightData.self_improvement_goals },
        { "Accountability Methods": insightData.accountability_methods },
        { "Aspirations": insightData.aspirations },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Personal Growth and Accountability"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "philanthropy-legacy-sustainability-impact": {
      bodyData = [
        { "Conservation Efforts": insightData.conservation_efforts },
        { "Sustainable Habits": insightData.sustainable_habits },
        { "Charitable Actions": insightData.charitable_actions },
        { "Long Term Legacy Plans": insightData.long_term_legacy_plans },
        { "Favorite Causes": insightData.favorite_causes },
        { "Motivations for Philanthropy": insightData.motivations_for_philanthropy },
        { "Advocacy Efforts": insightData.advocacy_efforts },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Philanthropy"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "privacy-security": {
      bodyData = [
        { "Privacy Preferences": insightData.privacy_preferences },
        { "Security Practices": insightData.security_practices },
        { "Any Notable Concerns": insightData.any_notable_concerns },
        { "Devices Used": insightData.devices_used },
        { "Backup & Recovery Procedures": insightData.backup_and_recovery_procedures },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Security"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "my-social-media": {
      bodyData = [
        { "Social Media Handles": insightData.social_media_handles },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="My Social Media"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "political-civic-engagement": {
      bodyData = [
        { "Civic Involvement": insightData.civic_involvement },
        { "Voting Habits": insightData.voting_habits },
        { "Community or Political Participation": insightData.community_or_political_participation },
        { "Key Policy Areas": insightData.key_policy_areas },
        { "Stance on Civic Responsibilities": insightData.stance_on_civic_responsibilities },
        { "Thoughts on Governance": insightData.thoughts_on_governance },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.community_or_political_participation || ""}
            subtitle={insightData.key_policy_areas || ""}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "family-composition-roles": {
      bodyData = [
        { "Family Composition": insightData.family_composition },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Family History"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "romantic-sexual": {
      bodyData = [
        { "Love Language": insightData.love_language },
        { "Relationship Status": insightData.relationship_status },
        { "Partner Details": insightData.partner_details },
        { "Preferences or Orientations": insightData.preferences_or_orientations },
        { "Communication or Boundaries": insightData.communication_or_boundaries },
        { "Current Goals or Concerns": insightData.current_goals_or_concerns },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.relationship_status}
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "consumer-behavior": {
      bodyData = [
        { "Shopping Preferences": insightData.shopping_preferences },
        { "Preferred Brands": insightData.preferred_brands },
        { "Excluded Brands": insightData.excluded_brands },
        { "Ethical or Sustainable Choices": insightData.ethical_sustainable_choices },
        { "Spending Triggers or Patterns": insightData.spending_triggers_or_patterns },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Shopping Preferences"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "communication-collaboration-styles": {
      bodyData = [
        { "Communication Preferences": insightData.communication_preferences },
        { "Collaboration Preferences": insightData.collaboration_preferences },
        { "Conflict Resolution": insightData.conflict_resolution },
        { "Negotiation Style": insightData.negotiation_style },
        { "Team Dynamics": insightData.team_dynamics },
        { "Preferred Communication Tools": insightData.preferred_communication_tools },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Collaboration Preferences"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "dream-diary": {
      const dreamEntries = Array.isArray(insightData.dream_details)
        ? insightData.dream_details
        : (insightData.dream_details ? [insightData.dream_details] : []);

      bodyData = [
        {
          "Dream Diary Entries": dreamEntries.length > 0 && (
            <div className="object-array-field">
              {dreamEntries.map((dreamItem, index) => (
                <ActionItem key={index} data={dreamItem} />
              ))}
            </div>
          )
        },
        { "Characters": insightData.characters },
        { "Symbols": insightData.symbols },
        { "Analysis": insightData.analysis },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.dream_title}
            subtitle={insightData.theme}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "business-intelligence": {
      bodyData = [
        { "Business Name": insightData.business_name },
        { "Core Business Functions": insightData.core_business_functions },
        { "Operations": insightData.operations },
        { "Sales": insightData.sales },
        { "Key Performance Indicators": insightData.key_performance_indicators },
        { "Decision Making Processes": insightData.decision_making_processes },
        { "Challenges & Pain Points": insightData.challenges_and_pain_points },
        { "Team Dynamics": insightData.team_dynamics },
        { "Products & Services": insightData.products_and_services },
        { "Revenue Streams": insightData.revenue_streams },
        { "SWOT Analysis": insightData.swot_analysis },
        { "Growth Strategy": insightData.growth_strategy },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Business Intelligence"
            subtitle={insightData.business_name || ""}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "resume-work-experience": {
      bodyData = [
        { "Portfolio": insightData.portfolio },
        { "Skills": insightData.skills },
        { "Work Experience": insightData.work_experience },
        { "Career Goals": insightData.career_goals },
        { "Education": insightData.education },
        { "Certifications & Licenses": insightData.certifications_licenses },
        { "References or Endorsements": insightData.references_or_endorsements },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="My Portfolio"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "organizations-corporations": {
      bodyData = [
        { "Locations": insightData.locations },
        { "Type": insightData.type },
        { "Industry": insightData.industry },
        { "Mission or Purpose": insightData.mission_or_purpose },
        { "Number of Employees": insightData.number_of_employees },
        { "Key People or Leadership": insightData.key_people_or_leadership },
        { "Culture": insightData.culture },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.organization_name}
            subtitle={insightData.industry}
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "password-vault": {
      bodyData = [
        { "Password Vault": insightData.password_vault },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="My Vault"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "video-animation-projects": {
      bodyData = [
        { "Content": insightData.content },
        { "Storyboard": insightData.storyboard },
        { "Script": insightData.script },
        { "Production Tools": insightData.production_tools },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={insightData.concept}
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "conversations-podcasts-debates": {
      bodyData = [
        { "Favorite Podcasts": insightData.favorite_podcasts },
        { "Debate Topics": insightData.debate_topics },
        { "Preferred Conversation Topics": insightData.preferred_conversation_topics },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Podcasts and Debates"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "thought-leaders-influencers": {
      bodyData = [
        { "Contemporary": insightData.contemporary },
        { "Historical": insightData.historical },
        { "Fictional": insightData.fictional },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Influencers"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    case "custom-lists": {
      bodyData = [
        { "Custom List": insightData["custom list"] },
      ].filter((item) => Object.values(item)[0] != null);

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title="Custom Lists"
            subtitle=""
          />
          {(!collapsed && <Body data={bodyData} />)}
        </div>
      );
    }

    default: {
      // If we have some unrecognized category or leftover data, do the fallback:
      const extractText = (data) => {
        if (Array.isArray(data)) {
          return data.map((item) => extractText(item)).join(', ');
        } else if (data && typeof data === 'object') {
          return Object.entries(data)
            .map(([k, v]) => `${k}: ${extractText(v)}`)
            .join(', ');
        }
        return String(data);
      };

      // Show the first piece of data as the Title, the rest as body
      const entries = Object.entries(insightData);
      if (entries.length === 0) return null;

      const [firstKey, firstValue] = entries[0];
      const bodyObject = Object.fromEntries(entries.slice(1));

      return (
        <div className="insight-item" data-category={insight.category}>
          <Title
            title={extractText(firstValue)}
            subtitle=""
          />
          {(!collapsed && (
            <div className="insight-body-options">{RenderData(bodyObject)}</div>
          ))}
        </div>
      );
    }
  }
};

export { InsightDisplay };
