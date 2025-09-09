"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, MessageSquare } from "lucide-react";

export function CommunicationTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Fast Code AI Communication Guidelines
        </CardTitle>
        <CardDescription>
          Effective communication practices for our organization
        </CardDescription>
      </CardHeader>
      <CardContent className="prose prose-slate max-w-none">
        <h2 className="text-xl font-semibold mt-2 mb-4">Introduction</h2>
        <p className="mb-4">
          Just as oxygen is essential for the survival and health of a
          living organism, effective information flow is the lifeblood of
          our organization. It ensures that every part of our system
          functions harmoniously and efficiently. In the absence of proper
          communication, our organizational health can suffer, leading to
          inefficiencies and a lack of coordination. Therefore,
          maintaining a robust and healthy information flow is imperative
          for the well-being of our team and the success of our projects.
        </p>
        <p className="mb-6">
          Effective communication with our coworkers is not just a
          professional necessity; it's a matter of good manners, akin to
          keeping our house clean. Ghosting, late messaging, and the
          failure to share information in a timely manner can create
          anxiety, frustration, and a loss of productivity as team members
          scramble to find the information they need. Just as we take care
          to maintain cleanliness and order in our personal spaces, we
          must also uphold the cleanliness of our communication practices.
          This ensures a respectful, efficient, and anxiety-free work
          environment for everyone.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          The Three Pillars of Information Flow
        </h2>
        <ol className="list-decimal pl-6 space-y-4 mb-6">
          <li className="pl-2">
            <strong className="font-medium">
              Information Generation:
            </strong>{" "}
            This is the creation of relevant, accurate, and timely
            information. Whether it's a project update, a technical
            document, or a simple vacation date or unavailability, the
            quality of the information we generate is fundamental to our
            effectiveness.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Information Propagation:
            </strong>{" "}
            This involves the efficient dissemination of information,
            ensuring that updates, whether personal or public, reach their
            intended audience promptly. This pillar is crucial for
            avoiding bottlenecks and keeping everyone aligned.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Information Storage and Cleanup:
            </strong>{" "}
            Regular maintenance of our digital repositories is essential.
            This includes not only storing valuable data but also purging
            outdated information to keep our systems streamlined and
            accessible.
          </li>
        </ol>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          Addressing Information Overload: A Good Problem to Have
        </h2>
        <p className="mb-6">
          While we strive for effective communication, there's a potential
          challenge of information overload. However, it's important to
          recognize that having abundant information is a positive sign of
          a vibrant, active organization. We are far from reaching a point
          where information becomes unmanageable. Instead, our focus
          should be on how we can process and manage this information
          effectively.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          Preprocessing Information: Techniques and Examples
        </h2>
        <p className="mb-4">
          To manage our information flow efficiently, we can employ
          various preprocessing techniques:
        </p>
        <ul className="list-disc pl-6 space-y-3 mb-6">
          <li className="pl-2">
            <strong className="font-medium">Compression:</strong> Just
            like compressing data makes it easier to manage, creating
            dashboards and graphs can distill complex information into
            more digestible formats.
          </li>
          <li className="pl-2">
            <strong className="font-medium">Clustering:</strong>{" "}
            Organizing our communication channels, such as creating more
            focused Slack groups, can help in categorizing information
            effectively, making it easier to access and manage. Short
            lived channels like tmp-* and warroom-* are alright as they
            create temporary routes to avoid overwhelming the system. Also
            archive them later to garbage collect.
          </li>
          <li className="pl-2">
            <strong className="font-medium">Batching:</strong> Compiling
            updates into digests or scheduling regular (monthly/weekly)
            reports can help in managing the flow of information, ensuring
            that everyone receives important updates without constant
            interruptions.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          Enough Talks, Let's focus on action
        </h2>
        <h3 className="text-lg font-medium mt-6 mb-3">
          Enhanced Communication Protocols
        </h3>
        <p className="mb-3">
          Introducing specific emojis as response indicators for quick and
          clear communication:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li className="pl-2">👍 for Agree (Agreed)</li>
          <li className="pl-2">✅ for ACK (Acknowledged)</li>
          <li className="pl-2">
            ✓ for Done (Sounds Good, Done, Makes Sense)
          </li>
          <li className="pl-2">
            🔄 for Now (Immediate action, Handling it now)
          </li>
          <li className="pl-2">
            ⏭️ for Next (Action after the current task, Focussed now, but
            you're next)
          </li>
          <li className="pl-2">🌙 for EOD (End of the Day)</li>
          <li className="pl-2">📅 for EOW (End of the Week)</li>
          <li className="pl-2">⏰ for Later (Not a priority)</li>
          <li className="pl-2">
            🧵 for Thread (Open new thread to efficiently group
            discussions)
          </li>
        </ul>
        <p className="mb-6">
          <strong className="font-medium">Rationale:</strong> TCP vs UDP
          =&gt; Always ACK, no one likes half open connection.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Timely Updates and Information Sharing
        </h3>
        <p className="mb-3">
          Encouraging a 'push' approach for both personal and public
          updates to prevent delays and keep everyone informed. Updates,
          delays and incidents are not good or bad, they are facts. They
          need to enter the system asap.
        </p>
        <ul className="list-disc pl-6 space-y-3 mb-4">
          <li className="pl-2">
            <strong className="font-medium">Personal Updates:</strong>{" "}
            Notify stakeholders of any personal time off, such as
            vacations or emergencies. Update your Slack status and inform
            your team about your absence, specifying a contact person
            during your time away.
          </li>
          <li className="pl-2">
            <strong className="font-medium">Project Updates:</strong> For
            projects, incidents, or critical situations, regularly push
            updates to relevant channels based on the severity. This could
            include Slack updates, emails, or brief meetings.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Cross-Departmental Updates:
            </strong>{" "}
            For multi-department projects, use bi-weekly meetings or
            shared dashboards to keep all parties aligned and informed
            about progress and decisions.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Emergency Communication Protocol:
            </strong>{" "}
            Establish a clear protocol for emergencies, including
            immediate notifications through group calls, priority emails,
            or dedicated channels. Specify who to inform, the
            communication method, and update frequency.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Passive Pushes and Compression:
            </strong>{" "}
            Utilize dashboards, alerts, and reports for real-time updates
            and critical notifications. Regular reports like weekly
            summaries provide a compressed view of ongoing activities.
          </li>
        </ul>
        <p className="mb-6">
          <strong className="font-medium">Rationale:</strong> Callback
          &gt;&gt;&gt; Polling
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Regular Maintenance of Information Systems
        </h3>
        <p className="mb-3">
          Effective communication and operational efficiency depend on the
          regular upkeep of our information systems:
        </p>
        <ul className="list-disc pl-6 space-y-3 mb-4">
          <li className="pl-2">
            <strong className="font-medium">
              Update Status and Deadlines:
            </strong>{" "}
            Keep project statuses and deadlines current across all
            channels, including project management tools and shared
            calendars.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Mark and Redirect Deprecated Documents:
            </strong>{" "}
            Identify outdated documents, mark them as deprecated, archive
            unused slack channels, and link to the updated versions to
            avoid confusion.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Maintain Confluence Pages:
            </strong>{" "}
            Regularly update Confluence pages or similar platforms to
            reflect changes in ownership, responsibilities, or team
            structures.
          </li>
          <li className="pl-2">
            <strong className="font-medium">Update OKRs:</strong> Promptly
            reflect any changes to Objectives and Key Results (OKRs) in
            relevant tracking systems to keep team goals transparent and
            aligned.
          </li>
        </ul>
        <p className="mb-6">
          <strong className="font-medium">Rationale:</strong> Garbage
          Collection ¯\_(ツ)_/¯
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Open Communication Culture
        </h3>
        <p className="mb-3">
          Fostering an open communication culture is key to efficient
          information propagation and team collaboration. We encourage
          practices that promote transparency and inclusivity:
        </p>
        <ul className="list-disc pl-6 space-y-3 mb-4">
          <li className="pl-2">
            <strong className="font-medium">
              Prefer Public Channels:
            </strong>{" "}
            Use public Slack channels for discussions and updates,
            ensuring that information is accessible to all relevant team
            members.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Document Objective Discussions:
            </strong>{" "}
            For detailed discussions on any subject, create a document,
            even a one-pager, to capture the conversation. This approach
            ensures that the rationale behind decisions is transparent and
            referenceable.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Publish Meeting Notes:
            </strong>{" "}
            Share meeting notes on a shared document or relevant Slack
            channel. This practice keeps those who couldn't attend
            informed and allows for continued asynchronous discussions.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Limit Private Communication:
            </strong>{" "}
            While 1:1 video calls and direct Slack messages are necessary
            at times, remember that information shared privately should be
            summarized and shared on public channels when relevant. This
            ensures that important updates or decisions are not confined
            to private conversations.
          </li>
          <li className="pl-2">
            <strong className="font-medium">
              Avoid broadcast messages:
            </strong>{" "}
            Avoid using @here or @channel (broadcast markers) on Slack
            Channels for non-broadcast communications, people who don't
            need to see the message at that moment should not lose focus
            with red bold notifications from Slack.
          </li>
        </ul>
        <p className="mb-6">
          <strong className="font-medium">Rationale:</strong> Cathedral vs
          Bazaar
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Mindful Use of 1:1 Messaging
        </h3>
        <p className="mb-4">
          Using direct messages judiciously to avoid overwhelming
          individuals and maintain transparency in our communication flow.
          I know I am repeating it. :)
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Open Calendar Policy
        </h3>
        <p className="mb-4">
          Implementing and maintaining open calendars to enhance
          transparency and efficiency in scheduling and planning.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Meeting Etiquette
        </h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li className="pl-2">
            In small meetings, keep the camera on for engagement; in large
            meetings (10 or more people), it's optional, especially if
            you're not speaking.
          </li>
          <li className="pl-2">
            Ensure good lighting, a professional background, and
            appropriate attire.
          </li>
          <li className="pl-2">
            Mute when not speaking and be mindful of your body language.
          </li>
          <li className="pl-2">
            Test your tech beforehand, avoid multitasking, and enter or
            exit discreetly.
          </li>
          <li className="pl-2">
            Be aware of your frame's content and respect others' choices
            regarding camera use.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">Enforcement</h2>
        <p className="mb-4">
          In our pursuit of an open communication culture, we focus on
          embracing and encouraging good practices rather than enforcing
          them. Sharing this document across platforms like Slack helps
          spread awareness and understanding of our guidelines. We lead by
          example, gently guiding colleagues towards better communication
          habits, much like reminding someone to take off their shoes
          before entering a house. When encountering non-adherence, we
          approach with support and offer guidance on using our
          communication tools effectively. This effort is akin to
          nurturing a garden, requiring collective care and attention. By
          committing to open sharing of information, we foster a
          transparent, inclusive, and collaborative environment, where
          every team member feels informed, connected, and empowered,
          ultimately strengthening our organization.
        </p>

        <p className="mt-6">
          <a
            href="https://www.nohello.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            Also please: https://www.nohello.com/{" "}
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
