/**
 * MeaningfulEventService - Invocable Apex action for extracting and storing
 * meaningful events from conversations. Called by Agentforce topics during
 * or after conversations.
 *
 * Meaningful events include: preferences, milestones, life-events, concerns, intents.
 * These are persisted to Data Cloud for future personalization.
 */
global with sharing class MeaningfulEventService {

    public class EventExtractionRequest {
        @InvocableVariable(required=true label='Customer ID')
        public String customerId;

        @InvocableVariable(required=true label='Session ID')
        public String sessionId;

        @InvocableVariable(required=false label='Conversation Transcript')
        public String conversationTranscript;

        @InvocableVariable(required=false label='Single User Message')
        public String userMessage;

        @InvocableVariable(required=false label='Event Type')
        public String eventType; // preference, milestone, life-event, concern, intent

        @InvocableVariable(required=false label='Event Description')
        public String eventDescription;

        @InvocableVariable(required=false label='Agent Note')
        public String agentNote;
    }

    public class EventExtractionResult {
        @InvocableVariable
        public Boolean success;

        @InvocableVariable
        public String eventsJson;

        @InvocableVariable
        public Integer eventsExtracted;

        @InvocableVariable
        public String errorMessage;
    }

    @InvocableMethod(label='Extract Meaningful Events' description='Extracts and stores meaningful events from conversation content')
    public static List<EventExtractionResult> extractMeaningfulEvents(List<EventExtractionRequest> requests) {
        List<EventExtractionResult> results = new List<EventExtractionResult>();

        for (EventExtractionRequest req : requests) {
            EventExtractionResult result = new EventExtractionResult();
            try {
                List<Map<String, String>> events = new List<Map<String, String>>();

                // If a specific event was provided directly, store it
                if (String.isNotBlank(req.eventType) && String.isNotBlank(req.eventDescription)) {
                    DataCloudProfileService.writeMeaningfulEvent(
                        req.customerId, req.sessionId,
                        req.eventType, req.eventDescription,
                        req.agentNote, null
                    );

                    Map<String, String> event = new Map<String, String>();
                    event.put('eventType', req.eventType);
                    event.put('description', req.eventDescription);
                    events.add(event);
                }
                // Otherwise, extract events from transcript or message
                else {
                    String textToAnalyze = String.isNotBlank(req.userMessage)
                        ? req.userMessage : req.conversationTranscript;

                    if (String.isNotBlank(textToAnalyze)) {
                        events = extractEventsFromText(textToAnalyze);

                        for (Map<String, String> event : events) {
                            DataCloudProfileService.writeMeaningfulEvent(
                                req.customerId, req.sessionId,
                                event.get('eventType'), event.get('description'),
                                event.get('agentNote'), null
                            );
                        }
                    }
                }

                result.success = true;
                result.eventsExtracted = events.size();
                result.eventsJson = JSON.serialize(events);
            } catch (Exception e) {
                result.success = false;
                result.errorMessage = e.getMessage();
                result.eventsExtracted = 0;
            }
            results.add(result);
        }

        return results;
    }

    /**
     * Extract meaningful events from text using keyword/pattern matching.
     * In production, replace with Einstein GPT or external LLM call for
     * more accurate semantic extraction.
     */
    private static List<Map<String, String>> extractEventsFromText(String text) {
        List<Map<String, String>> events = new List<Map<String, String>>();
        String lower = text.toLowerCase();

        // Life events
        if (lower.contains('anniversary')) {
            events.add(createEvent('life-event', 'Mentioned an upcoming anniversary', 'May be looking for gifts'));
        }
        if (lower.contains('birthday')) {
            events.add(createEvent('life-event', 'Mentioned a birthday', 'Potential gifting opportunity'));
        }
        if (lower.contains('wedding')) {
            events.add(createEvent('life-event', 'Mentioned a wedding', 'May need special occasion products'));
        }
        if (lower.contains('pregnant') || lower.contains('baby')) {
            events.add(createEvent('life-event', 'Mentioned pregnancy or new baby', 'May be looking for celebratory gifts'));
        }
        if (lower.contains('moving') || lower.contains('new home') || lower.contains('relocat')) {
            events.add(createEvent('life-event', 'Mentioned moving or relocation', 'May need home bar or entertaining essentials'));
        }

        // Travel/trips
        if (lower.contains('trip') || lower.contains('vacation') || lower.contains('flying') || lower.contains('travel')) {
            events.add(createEvent('life-event', 'Has upcoming travel plans', 'May need travel-friendly luxury items'));
        }

        // Preferences
        if (lower.contains('limited edition') || lower.contains('rare') || lower.contains('exclusive')) {
            events.add(createEvent('preference', 'Interested in limited edition or rare items', 'Prioritize exclusive offerings'));
        }
        if (lower.contains('vintage') || lower.contains('collector') || lower.contains('investment piece')) {
            events.add(createEvent('preference', 'Values vintage or collector items', 'Filter recommendations for collectible pieces'));
        }
        if (lower.contains('sustainable') || lower.contains('ethical') || lower.contains('responsible')) {
            events.add(createEvent('preference', 'Prefers sustainable/ethical luxury', null));
        }

        // Concerns
        if (lower.contains('auction') || lower.contains('appraisal')) {
            events.add(createEvent('concern', 'Interest in auction or appraisal', 'May need authentication or valuation guidance'));
        }
        if (lower.contains('storage') || lower.contains('preservation')) {
            events.add(createEvent('concern', 'Concerned about storage or preservation', 'Recommend proper storage solutions'));
        }
        if (lower.contains('authenticity') || lower.contains('counterfeit')) {
            events.add(createEvent('concern', 'Has authenticity concerns', 'Provide provenance and certification details'));
        }

        // Intents
        if (lower.contains('first luxury purchase') || lower.contains('starting a collection') || lower.contains('new to fine spirits')) {
            events.add(createEvent('intent', 'Wants to begin a luxury collection', 'Guide with entry-level prestige pieces'));
        }
        if (lower.contains('gift for') || lower.contains('shopping for someone')) {
            events.add(createEvent('intent', 'Shopping for a gift', 'Ask about the recipient'));
        }

        return events;
    }

    private static Map<String, String> createEvent(String eventType, String description, String agentNote) {
        Map<String, String> event = new Map<String, String>();
        event.put('eventType', eventType);
        event.put('description', description);
        event.put('agentNote', agentNote);
        return event;
    }
}
