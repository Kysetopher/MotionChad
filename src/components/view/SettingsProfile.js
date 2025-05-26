import React, { useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import '../../styles/insights.css';
import { InsightDisplay } from '../insights/insightElement';

const SettingsProfile = () => {
  const { userData, ReverieManager, userInsights } = useGeneralContext();

  const categoryDictionary = {
    "agent-behavior-custom-instructions": "AGENT BEHAVIOR🔹CUSTOM INSTRUCTIONS",
    "appearance-personal-style": "APPEARANCE🔹PERSONAL STYLE",
    "art-imagery": "ART🔹IMAGERY",
    "books-audiobooks": "BOOKS🔹AUDIOBOOKS",
    "business-intelligence": "BUSINESS INTELLIGENCE",
    "communication-collaboration-styles": "COMMUNICATION🔹COLLABORATION STYLES",
    "community-membership": "COMMUNITY MEMBERSHIP",
    "consumer-behavior": "CONSUMER BEHAVIOR",
    "conversations-podcasts-debates": "CONVERSATIONS🔹PODCASTS🔹DEBATES",
    "custom-lists": "CUSTOM LISTS",    
    "research-interests-curiosity": "INTEREST🔹CURIOSITY",
    "dates-calendar-planner-schedule": "DATES🔹CALENDAR🔹PLANNER🔹SCHEDULE",
    "decision-making-styles": "DECISION-MAKING STYLES",
    "dream-diary": "DREAM DIARY",
    "event-attending": "EVENT ATTENDING",
    "event-hosting": "EVENT HOSTING",
    "family-composition-roles": "FAMILY🔹COMPOSITION🔹ROLES",
    "financial-planning": "FINANCIAL PLANNING",
    "food-cooking-cuisine-dietary-nutrition": "FOOD🔹COOKING🔹CUISINE🔹NUTRITION",
    "games-gaming": "GAMES🔹GAMING",
    "geographic-location": "GEOGRAPHIC LOCATION",
    "health-sleep-medicine": "HEALTH🔹SLEEP🔹MEDICINE",
    "hobbies-habits-leisure": "HOBBIES🔹HABITS🔹LEISURE",
    "humor-comedy-inside-humor": "HUMOR🔹COMEDY🔹INSIDE HUMOR",
    "introspection-reflections-values-principles": "REFLECTIONS🔹VALUES🔹PRINCIPLES",
    "language-preferences-proficiency": "LANGUAGE PREFERENCES🔹PROFICIENCY",
    "lectures": "LECTURES",
    "memories-life-events": "MEMORIES🔹LIFE EVENTS",
    "mental-health-emotional-wellbeing": "MENTAL HEALTH🔹EMOTIONAL WELLBEING",
    "movies-tv-anime": "MOVIES🔹TV🔹ANIME",
    "song-writer": "MY SONGS",
    "my-social-media": "MY SOCIAL MEDIA",
    "pets-animals": "PETS🔹ANIMALS",
    "news-current-affairs": "NEWS🔹CURRENT AFFAIRS",
    "organizations-corporations": "ORGANIZATIONS🔹CORPORATIONS",
    "password-vault": "PASSWORD VAULT",
    "personal-contacts-relationships": "PERSONAL CONTACTS🔹RELATIONSHIPS",
    "personal-growth-accountability": "PERSONAL GROWTH🔹ACCOUNTABILITY",
    "personality-traits-motivations": "PERSONALITY TRAITS🔹MOTIVATIONS",
    "pets": "PETS",
    "philanthropy-legacy-sustainability-impact": "PHILANTHROPY🔹LEGACY🔹SUSTAINABILITY🔹IMPACT",
    "philosophical-ideological-existential": "PHILOSOPHICAL🔹IDEOLOGICAL🔹EXISTENTIAL",
    "physical-environment-transportation-sensory-preferences": "ENVIRONMENT🔹TRANSPORTATION🔹SENSORY PREFERENCES",
    "physical-fitness-exercise": "PHYSICAL FITNESS🔹EXERCISE",
    "political-civic-engagement": "POLITICAL🔹CIVIC ENGAGEMENT",
    "privacy-security": "PRIVACY🔹SECURITY",
    "projects": "PROJECTS",
    "reminders": "REMINDERS",
    "resume-work-experience": "RESUME🔹WORK EXPERIENCE",
    "romantic-sexual": "ROMANTIC🔹SEXUAL",
    "social-cultural-identity": "SOCIAL🔹CULTURAL🔹IDENTITY",
    "thought-leaders-influencers": "THOUGHT LEADERS🔹INFLUENCERS",
    "todos-tasks": "TODOS🔹TASKS",
    "travel-plans": "TRAVEL PLANS",
    "user-information": "USER INFORMATION",
    "video-animation-projects": "VIDEO🔹ANIMATION🔹PROJECTS",
    "writing-stories": "WRITING🔹STORIES",
  };

  const groupedInsights = userInsights.reduce((groups, insight) => {
    const { category } = insight;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(insight);
    return groups;
  }, {});

  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (category) => {
    setCollapsedCategories((prevState) => ({
      ...prevState,
      [category]: !prevState[category],
    }));
  };

  // Sort categories based on the order of categoryDictionary
  const sortedCategories = Object.keys(groupedInsights).sort((a, b) => {
    const indexA = Object.keys(categoryDictionary).indexOf(a);
    const indexB = Object.keys(categoryDictionary).indexOf(b);
    return indexA - indexB;
  });

  return (
    <div className="tile-container">
      {sortedCategories.map((category) => (
        <div key={category} className="insight-category-container">
          <div
            className="card-container-tab"
            onClick={() => toggleCategory(category)}
          >
            <div className="card-container-title-count">
              {collapsedCategories[category] ? '▶' : '▼'}
            </div>
            <div className="card-container-title">
              {categoryDictionary[category] || category}
            </div>
          </div>
          {!collapsedCategories[category] && (
            <div className="insights-container">
              {groupedInsights[category].map((insight, index) => (
                < InsightDisplay key={index} insight={insight} /> 
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SettingsProfile;