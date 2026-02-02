/**
 * CaptureKeyEventsService - Simplified invocable action for Agentforce.
 * Matches the ProductCatalogService pattern (List<String> return, optional inputs)
 * to ensure compatibility with the Agentforce planner.
 */
global with sharing class CaptureKeyEventsService {

    public class EventExtractionRequest {
        @InvocableVariable(required=false label='Customer ID')
        public String customerId;

        @InvocableVariable(required=false label='Session ID')
        public String sessionId;

        @InvocableVariable(required=false label='Conversation Transcript')
        public String conversationTranscript;

        @InvocableVariable(required=false label='Event Type')
        public String eventType;

        @InvocableVariable(required=false label='Event Description')
        public String eventDescription;
    }

    @InvocableMethod(label='Capture Key Events' description='Extracts and stores meaningful events from conversation content')
    public static List<String> captureKeyEvents(List<EventExtractionRequest> requests) {
        List<String> results = new List<String>();

        for (EventExtractionRequest req : requests) {
            Map<String, Object> result = new Map<String, Object>();
            try {
                List<Map<String, String>> events = new List<Map<String, String>>();

                if (String.isNotBlank(req.eventType) && String.isNotBlank(req.eventDescription)) {
                    if (String.isNotBlank(req.customerId) && String.isNotBlank(req.sessionId)) {
                        DataCloudProfileService.writeMeaningfulEvent(
                            req.customerId, req.sessionId,
                            req.eventType, req.eventDescription,
                            null, null
                        );
                    }
                    Map<String, String> event = new Map<String, String>();
                    event.put('eventType', req.eventType);
                    event.put('description', req.eventDescription);
                    events.add(event);
                } else if (String.isNotBlank(req.conversationTranscript)) {
                    events = extractEventsFromText(req.conversationTranscript);
                    if (String.isNotBlank(req.customerId) && String.isNotBlank(req.sessionId)) {
                        for (Map<String, String> event : events) {
                            DataCloudProfileService.writeMeaningfulEvent(
                                req.customerId, req.sessionId,
                                event.get('eventType'), event.get('description'),
                                event.get('agentNote'), null
                            );
                        }
                    }
                }

                result.put('success', true);
                result.put('eventsExtracted', events.size());
                result.put('events', events);
            } catch (Exception e) {
                result.put('success', false);
                result.put('error', e.getMessage());
            }
            results.add(JSON.serialize(result));
        }

        return results;
    }

    private static List<Map<String, String>> extractEventsFromText(String text) {
        List<Map<String, String>> events = new List<Map<String, String>>();
        String lower = text.toLowerCase();

        if (lower.contains('anniversary')) events.add(createEvent('life-event', 'Mentioned an upcoming anniversary', 'May be looking for gifts'));
        if (lower.contains('birthday')) events.add(createEvent('life-event', 'Mentioned a birthday', 'Potential gifting opportunity'));
        if (lower.contains('wedding')) events.add(createEvent('life-event', 'Mentioned a wedding', 'May need special occasion products'));
        if (lower.contains('pregnant') || lower.contains('baby')) events.add(createEvent('life-event', 'Mentioned pregnancy or new baby', 'May need pregnancy-safe products'));
        if (lower.contains('moving') || lower.contains('new home') || lower.contains('relocat')) events.add(createEvent('life-event', 'Mentioned moving or relocation', 'Climate change may affect skin'));
        if (lower.contains('trip') || lower.contains('vacation') || lower.contains('flying') || lower.contains('travel')) events.add(createEvent('life-event', 'Has upcoming travel plans', 'May need travel-size products or SPF'));
        if (lower.contains('fragrance-free') || lower.contains('no fragrance') || lower.contains('unscented')) events.add(createEvent('preference', 'Prefers fragrance-free products', 'Likely has sensitivity'));
        if (lower.contains('cruelty-free') || lower.contains('vegan') || lower.contains('clean beauty')) events.add(createEvent('preference', 'Values clean/cruelty-free beauty', 'Filter recommendations accordingly'));
        if (lower.contains('organic') || lower.contains('natural ingredients')) events.add(createEvent('preference', 'Prefers organic/natural products', null));
        if (lower.contains('breakout') || lower.contains('breaking out')) events.add(createEvent('concern', 'Experiencing breakouts', 'Check current routine for potential irritants'));
        if (lower.contains('dry') && (lower.contains('skin') || lower.contains('flak'))) events.add(createEvent('concern', 'Experiencing dry/flaky skin', 'May need richer moisturizer'));
        if (lower.contains('sensiti') && lower.contains('skin')) events.add(createEvent('concern', 'Has sensitive skin concerns', 'Avoid harsh ingredients'));
        if (lower.contains('start a routine') || lower.contains('new to skincare') || lower.contains('beginner')) events.add(createEvent('intent', 'Wants to start a skincare routine', 'Guide with basics first'));
        if (lower.contains('gift for') || lower.contains('shopping for someone')) events.add(createEvent('intent', 'Shopping for a gift', 'Ask about the recipient'));

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
